"""
Extract and process the authentic NASA B0005 Lithium-ion Battery Dataset
directly from NASA Ames Prognostics Data Repository.
"""

import io
import os
import struct
import zlib
import zipfile
import urllib.request
import numpy as np
import pandas as pd
import scipy.io

NASA_ZIP_URL = "https://phm-datasets.s3.amazonaws.com/NASA/5.+Battery+Data+Set.zip"
# From our range discovery:
INNER_ZIP_OFFSET = 129
INNER_ZIP_COMP_SIZE = 56531301

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
OUTPUT_CSV = os.path.join(DATA_DIR, "B0005_thermal_events.csv")
OUTPUT_SUMMARY_CSV = os.path.join(DATA_DIR, "B0005_cycle_summary.csv")

def download_inner_zip():
    os.makedirs(DATA_DIR, exist_ok=True)
    temp_zip_path = os.path.join(DATA_DIR, "BatteryAgingARC-FY08Q4.zip")
    
    if os.path.exists(temp_zip_path) and os.path.getsize(temp_zip_path) > 50000000:
        print(f"Using cached zip: {temp_zip_path}")
        return temp_zip_path

    print(f"Downloading NASA B0005 source stream ({INNER_ZIP_COMP_SIZE / (1024*1024):.1f} MB)...")
    end_byte = INNER_ZIP_OFFSET + INNER_ZIP_COMP_SIZE - 1
    req = urllib.request.Request(NASA_ZIP_URL, headers={"Range": f"bytes={INNER_ZIP_OFFSET}-{end_byte}"})
    
    with urllib.request.urlopen(req, timeout=120) as response:
        deflated_data = response.read()

    print(f"Decompressing inner zip ({len(deflated_data)} bytes)...")
    # Decompress raw deflate stream (wbits=-15)
    decompressed = zlib.decompress(deflated_data, -15)
    
    with open(temp_zip_path, "wb") as f:
        f.write(decompressed)
    print(f"Saved inner zip to {temp_zip_path}")
    return temp_zip_path

def process_b0005_mat(zip_path):
    print("Extracting B0005.mat...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        mat_filenames = [f for f in zf.namelist() if "B0005.mat" in f]
        if not mat_filenames:
            raise FileNotFoundError(f"B0005.mat not found in zip. Files: {zf.namelist()}")
        mat_file = mat_filenames[0]
        mat_bytes = zf.read(mat_file)
        
    print(f"Parsing MATLAB structure ({len(mat_bytes) / (1024*1024):.2f} MB)...")
    mat_data = scipy.io.loadmat(io.BytesIO(mat_bytes))
    
    b0005 = mat_data["B0005"]
    cycles_struct = b0005[0, 0]["cycle"][0]
    
    rows = []
    cycle_summary_rows = []
    discharge_cycle_idx = 0
    
    DEFAULT_THRESHOLD = 40.0
    
    for c_idx, cycle_obj in enumerate(cycles_struct):
        cycle_type = cycle_obj["type"][0]
        if cycle_type != "discharge":
            continue
            
        discharge_cycle_idx += 1
        data_struct = cycle_obj["data"][0, 0]
        
        # Extract fields
        voltages = data_struct["Voltage_measured"][0].astype(float)
        currents = data_struct["Current_measured"][0].astype(float)
        temps = data_struct["Temperature_measured"][0].astype(float)
        times = data_struct["Time"][0].astype(float)
        
        # Capacity if present
        capacity = np.nan
        if "Capacity" in data_struct.dtype.names and len(data_struct["Capacity"][0]) > 0:
            capacity = float(data_struct["Capacity"][0][0])
            
        n_pts = len(temps)
        if n_pts == 0:
            continue
            
        # Determine episodes for this cycle
        in_episode = False
        reading_events = 0
        episode_events = 0
        max_temp = float(np.max(temps))
        min_temp = float(np.min(temps))
        mean_temp = float(np.mean(temps))
        
        for p in range(n_pts):
            t_val = float(temps[p])
            time_val = float(times[p])
            v_val = float(voltages[p])
            i_val = float(currents[p])
            
            is_reading_event = t_val > DEFAULT_THRESHOLD
            if is_reading_event:
                reading_events += 1
                
            is_episode_start = False
            if t_val > DEFAULT_THRESHOLD:
                if not in_episode:
                    in_episode = True
                    is_episode_start = True
                    episode_events += 1
            else:
                if t_val <= (DEFAULT_THRESHOLD - 0.2): # 0.2C hysteresis
                    in_episode = False
                    
            rows.append({
                "cycle": discharge_cycle_idx,
                "time_s": round(time_val, 2),
                "temperature_c": round(t_val, 3),
                "voltage_v": round(v_val, 4),
                "current_a": round(i_val, 4),
                "reading_event": int(is_reading_event),
                "episode_event": int(is_episode_start)
            })
            
        cycle_summary_rows.append({
            "cycle": discharge_cycle_idx,
            "duration_s": round(float(times[-1] if n_pts > 0 else 0), 2),
            "capacity_ah": round(capacity, 4) if not np.isnan(capacity) else None,
            "min_temperature_c": round(min_temp, 3),
            "mean_temperature_c": round(mean_temp, 3),
            "max_temperature_c": round(max_temp, 3),
            "reading_events_40c": reading_events,
            "episode_events_40c": episode_events
        })
        
    df_events = pd.DataFrame(rows)
    df_events.to_csv(OUTPUT_CSV, index=False)
    print(f"Generated {OUTPUT_CSV}: {len(df_events)} data points across {discharge_cycle_idx} discharge cycles.")
    
    df_summary = pd.DataFrame(cycle_summary_rows)
    df_summary.to_csv(OUTPUT_SUMMARY_CSV, index=False)
    print(f"Generated {OUTPUT_SUMMARY_CSV}: {len(df_summary)} cycles summarized.")

if __name__ == "__main__":
    zip_path = download_inner_zip()
    process_b0005_mat(zip_path)
