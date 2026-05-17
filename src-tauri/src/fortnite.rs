use std::path::Path;
use std::collections::HashMap;
use std::sync::LazyLock;
use std::fs;

#[derive(serde::Serialize)]
pub struct BuildInfo {
    pub version: String,
    pub cl: String,
    pub exe_path: String,
    pub icon: Option<String>,
    pub valid: bool,
    pub error: Option<String>,
}

#[derive(serde::Serialize)]
pub struct VerifyResult {
    pub passed: bool,
    pub files_checked: u32,
    pub unexpected_files: Vec<String>,
    pub missing_files: Vec<String>,
    pub paks_path: String,
    pub error: Option<String>,
}

const EXPECTED_CL: &str = "4072250";

static BUILD_TO_VERSION: LazyLock<HashMap<u64, &'static str>> = LazyLock::new(|| {
    HashMap::from([
        (2870186, "1.0.0"),
        (3700114, "1.7.2"),
        (3724489, "1.8.0"),
        (3729133, "1.8.1"),
        (3741772, "1.8.2"),
        (3757339, "1.9"),
        (3775276, "1.9.1"),
        (3790078, "1.10"),
        (3807424, "1.11"),
        (3825894, "2.1"),
        (3841827, "2.2"),
        (3847564, "2.3"),
        (3858292, "2.4"),
        (3870737, "2.4.2"),
        (3889387, "2.5"),
        (3901517, "3.0.0"),
        (3915963, "3.1"),
        (3917250, "3.1.1"),
        (3935073, "3.2"),
        (3942182, "3.3"),
        (4008490, "3.5"),
        (4019403, "3.6"),
        (4039451, "4.0"),
        (4053532, "4.1"),
        (4072250, "4.2"),
        (4117433, "4.4"),
        (4127312, "4.4.1"),
        (4159770, "4.5"),
        (4204761, "5.0"),
        (4214610, "5.01"),
        (4240749, "5.10"),
        (4288479, "5.21"),
        (4305896, "5.30"),
        (4352937, "5.40"),
        (4363240, "5.41"),
        (4395664, "6.0"),
        (4424678, "6.01"),
        (4461277, "6.0.2"),
        (4464155, "6.10"),
        (4476098, "6.10.1"),
        (4480234, "6.10.2"),
        (4526925, "6.21"),
        (4543176, "6.22"),
        (4573279, "6.31"),
        (4629139, "7.0"),
        (4667333, "7.10"),
        (4727874, "7.20"),
        (4834550, "7.30"),
        (5046157, "7.40"),
        (5203069, "8.00"),
        (5625478, "8.20"),
        (5793395, "8.30"),
        (6005771, "8.40"),
        (6058028, "8.50"),
        (6165369, "8.51"),
        (6337466, "9.00"),
        (6428087, "9.01"),
        (6639283, "9.10"),
        (6922310, "9.21"),
        (7095426, "9.30"),
        (7315705, "9.40"),
        (7609292, "9.41"),
        (7704164, "10.00"),
        (7955722, "10.10"),
        (8456527, "10.20"),
        (8723043, "10.31"),
        (9380822, "10.40"),
        (9603448, "11.00"),
        (9901083, "11.10"),
        (10708866, "11.30"),
        (10800459, "11.31"),
        (11265652, "11.50"),
        (11556442, "12.00"),
        (11883027, "12.10"),
        (12353830, "12.21"),
        (12905909, "12.41"),
        (13137020, "12.50"),
        (13498980, "12.61"),
        (14113327, "13.40"),
        (14211474, "14.00"),
        (14456520, "14.30"),
        (14550713, "14.40"),
        (14786821, "14.60"),
        (14835335, "15.00"),
        (15014719, "15.10"),
        (15341163, "15.30"),
        (15526472, "15.50"),
        (15913292, "16.10"),
        (16163563, "16.30"),
        (16218553, "16.40"),
        (16469788, "16.50"),
        (16745144, "17.10"),
        (17004569, "17.30"),
        (17269705, "17.40"),
        (17388565, "17.50"),
        (17468642, "18.00"),
        (17661844, "18.10"),
        (17745267, "18.20"),
        (17811397, "18.21"),
        (17882303, "18.30"),
        (18163738, "18.40"),
        (18489740, "19.01"),
        (18675304, "19.10"),
        (19458861, "20.00"),
        (19598943, "20.10"),
        (19751212, "20.20"),
        (19950687, "20.30"),
        (20244966, "20.40"),
        (20463113, "21.00"),
        (20696680, "21.10"),
        (21035704, "21.20"),
        (21657658, "21.50"),
    ])
});

#[tauri::command]
pub fn validate_build_folder(path: &str) -> Result<bool, String> {
    let base = Path::new(path);
    let has_engine = base.join("Engine").is_dir();
    let has_fortnite = base.join("FortniteGame").is_dir();
    Ok(has_engine && has_fortnite)
}

#[tauri::command]
pub fn verify_build_integrity(path: &str) -> Result<VerifyResult, String> {
    let paks_dir = Path::new(path)
        .join("FortniteGame")
        .join("Content")
        .join("Paks");

    let paks_path_str = paks_dir.to_string_lossy().to_string();

    if !paks_dir.exists() {
        return Ok(VerifyResult {
            passed: false,
            files_checked: 0,
            unexpected_files: vec![],
            missing_files: vec![],
            paks_path: paks_path_str,
            error: Some("Content/Paks directory not found.".into()),
        });
    }

    let expected_paks: Vec<&str> = vec![
        "pakchunk0-WindowsClient.pak",
        "pakchunk0_s1-WindowsClient.pak",
        "pakchunk0_s2-WindowsClient.pak",
        "pakchunk0_s3-WindowsClient.pak",
        "pakchunk1-WindowsClient.pak",
        "pakchunk2-WindowsClient.pak",
        "pakchunk5-WindowsClient.pak",
        "pakchunk7-WindowsClient.pak",
        "pakchunk8-WindowsClient.pak",
        "pakchunk9-WindowsClient.pak",
    ];

    let expected_sigs: Vec<&str> = vec![
        "pakchunk0-WindowsClient.sig",
        "pakchunk0_s1-WindowsClient.sig",
        "pakchunk0_s2-WindowsClient.sig",
        "pakchunk0_s3-WindowsClient.sig",
        "pakchunk1-WindowsClient.sig",
        "pakchunk2-WindowsClient.sig",
        "pakchunk5-WindowsClient.sig",
        "pakchunk7-WindowsClient.sig",
        "pakchunk8-WindowsClient.sig",
        "pakchunk9-WindowsClient.sig",
    ];

    let entries = fs::read_dir(&paks_dir)
        .map_err(|e| format!("Failed to read Paks directory: {}", e))?;

    let mut found_paks: Vec<String> = Vec::new();
    let mut found_sigs: Vec<String> = Vec::new();

    for entry in entries.flatten() {
        let path = entry.path();
        let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
        let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
        match ext {
            "pak" => found_paks.push(name),
            "sig" => found_sigs.push(name),
            _ => {}
        }
    }

    if found_paks.is_empty() {
        return Ok(VerifyResult {
            passed: false,
            files_checked: 0,
            unexpected_files: vec![],
            missing_files: vec![],
            paks_path: paks_path_str,
            error: Some("No .pak files found in Content/Paks.".into()),
        });
    }

    let mut unexpected: Vec<String> = Vec::new();

    for pak in &found_paks {
        if !expected_paks.contains(&pak.as_str()) {
            unexpected.push(pak.clone());
        }
    }

    for sig in &found_sigs {
        if !expected_sigs.contains(&sig.as_str()) {
            unexpected.push(sig.clone());
        }
    }

    let missing: Vec<String> = expected_paks
        .iter()
        .filter(|e| !found_paks.iter().any(|p| p == *e))
        .map(|s| s.to_string())
        .collect();

    if !unexpected.is_empty() || !missing.is_empty() {
        return Ok(VerifyResult {
            passed: false,
            files_checked: found_paks.len() as u32,
            unexpected_files: unexpected,
            missing_files: missing,
            paks_path: paks_path_str,
            error: None,
        });
    }

    Ok(VerifyResult {
        passed: true,
        files_checked: found_paks.len() as u32,
        unexpected_files: vec![],
        missing_files: vec![],
        paks_path: paks_path_str,
        error: None,
    })
}

#[tauri::command]
pub fn detect_build_version(path: &str) -> Result<BuildInfo, String> {
    let base = Path::new(path);

    let exe_path = base
        .join("FortniteGame")
        .join("Binaries")
        .join("Win64")
        .join("FortniteClient-Win64-Shipping.exe");

    if !exe_path.exists() {
        return Ok(BuildInfo {
            version: String::new(),
            cl: String::new(),
            exe_path: String::new(),
            icon: None,
            valid: false,
            error: Some("FortniteClient-Win64-Shipping.exe not found.".into()),
        });
    }

    let version_string = get_file_version_info(&exe_path.to_string_lossy())
        .map_err(|e| format!("Failed to read version info: {}", e))?;

    let cl = extract_cl(&version_string);
    let version = resolve_version(&cl);
    let icon = extract_exe_icon(&exe_path.to_string_lossy());

    let valid = cl == EXPECTED_CL;

    Ok(BuildInfo {
        version,
        cl: cl.clone(),
        exe_path: exe_path.to_string_lossy().into(),
        icon,
        valid,
        error: if !valid {
            Some("This build doesn't match. Please import Fortnite 4.2 (CL-4072250).".into())
        } else {
            None
        },
    })
}

fn extract_cl(version_string: &str) -> String {
    if let Some(idx) = version_string.find("+++") {
        let before_plus = &version_string[..idx];
        if let Some(dash_idx) = before_plus.rfind('-') {
            return before_plus[dash_idx + 1..].to_string();
        }
    }

    if let Some(dash_idx) = version_string.find('-') {
        let after_dash = &version_string[dash_idx + 1..];
        let cl_part = after_dash.split('+').next().unwrap_or(after_dash);
        if cl_part.chars().all(|c| c.is_ascii_digit()) && !cl_part.is_empty() {
            return cl_part.to_string();
        }
    }

    let parts: Vec<&str> = version_string.split('.').collect();
    if parts.len() >= 4 {
        let last = parts[3].split(|c: char| !c.is_ascii_digit()).next().unwrap_or("");
        if !last.is_empty() {
            return last.to_string();
        }
    }

    if parts.len() >= 3 {
        let third = parts[2].split(|c: char| !c.is_ascii_digit()).next().unwrap_or("");
        if third.len() > 4 {
            return third.to_string();
        }
    }

    String::from("0")
}

fn resolve_version(cl: &str) -> String {
    if let Ok(cl_num) = cl.parse::<u64>() {
        if let Some(version) = BUILD_TO_VERSION.get(&cl_num) {
            return version.to_string();
        }
    }
    String::from("Unknown")
}

#[cfg(target_os = "windows")]
fn get_file_version_info(path: &str) -> Result<String, String> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use std::ptr;

    let wide_path: Vec<u16> = OsStr::new(path).encode_wide().chain(std::iter::once(0)).collect();

    unsafe {
        let size = windows_sys::Win32::Storage::FileSystem::GetFileVersionInfoSizeW(
            wide_path.as_ptr(),
            ptr::null_mut(),
        );

        if size == 0 {
            return Err("GetFileVersionInfoSizeW returned 0".into());
        }

        let mut buffer: Vec<u8> = vec![0; size as usize];

        let success = windows_sys::Win32::Storage::FileSystem::GetFileVersionInfoW(
            wide_path.as_ptr(),
            0,
            size,
            buffer.as_mut_ptr() as *mut _,
        );

        if success == 0 {
            return Err("GetFileVersionInfoW failed".into());
        }

        let mut ptr: *mut std::ffi::c_void = ptr::null_mut();
        let mut len: u32 = 0;

        let query: Vec<u16> = OsStr::new("\\StringFileInfo\\040904b0\\ProductVersion")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        let result = windows_sys::Win32::Storage::FileSystem::VerQueryValueW(
            buffer.as_ptr() as *const _,
            query.as_ptr(),
            &mut ptr,
            &mut len,
        );

        if result != 0 && !ptr.is_null() && len > 0 {
            let slice = std::slice::from_raw_parts(ptr as *const u16, len as usize);
            let version_str = String::from_utf16_lossy(slice).trim_end_matches('\0').to_string();
            return Ok(version_str);
        }

        let query2: Vec<u16> = OsStr::new("\\StringFileInfo\\000004b0\\ProductVersion")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        let result2 = windows_sys::Win32::Storage::FileSystem::VerQueryValueW(
            buffer.as_ptr() as *const _,
            query2.as_ptr(),
            &mut ptr,
            &mut len,
        );

        if result2 != 0 && !ptr.is_null() && len > 0 {
            let slice = std::slice::from_raw_parts(ptr as *const u16, len as usize);
            let version_str = String::from_utf16_lossy(slice).trim_end_matches('\0').to_string();
            return Ok(version_str);
        }

        let root_query: Vec<u16> = OsStr::new("\\")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        let result3 = windows_sys::Win32::Storage::FileSystem::VerQueryValueW(
            buffer.as_ptr() as *const _,
            root_query.as_ptr(),
            &mut ptr,
            &mut len,
        );

        if result3 == 0 || ptr.is_null() {
            return Err("VerQueryValueW failed".into());
        }

        let info = &*(ptr as *const windows_sys::Win32::Storage::FileSystem::VS_FIXEDFILEINFO);

        let major = (info.dwProductVersionMS >> 16) & 0xFFFF;
        let minor = info.dwProductVersionMS & 0xFFFF;
        let patch = (info.dwProductVersionLS >> 16) & 0xFFFF;
        let build = info.dwProductVersionLS & 0xFFFF;

        Ok(format!("{}.{}.{}.{}", major, minor, patch, build))
    }
}

#[cfg(not(target_os = "windows"))]
fn get_file_version_info(_path: &str) -> Result<String, String> {
    Err("Version detection only supported on Windows".into())
}

#[cfg(target_os = "windows")]
fn extract_exe_icon(path: &str) -> Option<String> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use base64::Engine;

    let wide_path: Vec<u16> = OsStr::new(path).encode_wide().chain(std::iter::once(0)).collect();

    unsafe {
        let hicon = windows_sys::Win32::UI::Shell::ExtractIconW(
            std::ptr::null_mut(),
            wide_path.as_ptr(),
            0,
        );

        if hicon.is_null() || hicon as usize <= 1 {
            return None;
        }

        let mut icon_info: windows_sys::Win32::UI::WindowsAndMessaging::ICONINFO = std::mem::zeroed();
        if windows_sys::Win32::UI::WindowsAndMessaging::GetIconInfo(hicon, &mut icon_info) == 0 {
            windows_sys::Win32::UI::WindowsAndMessaging::DestroyIcon(hicon);
            return None;
        }

        let hdc = windows_sys::Win32::Graphics::Gdi::CreateCompatibleDC(std::ptr::null_mut());
        let mut bmp_info: windows_sys::Win32::Graphics::Gdi::BITMAPINFO = std::mem::zeroed();
        bmp_info.bmiHeader.biSize = std::mem::size_of::<windows_sys::Win32::Graphics::Gdi::BITMAPINFOHEADER>() as u32;

        windows_sys::Win32::Graphics::Gdi::GetDIBits(
            hdc,
            icon_info.hbmColor,
            0,
            0,
            std::ptr::null_mut(),
            &mut bmp_info,
            windows_sys::Win32::Graphics::Gdi::DIB_RGB_COLORS,
        );

        let width = bmp_info.bmiHeader.biWidth;
        let height = bmp_info.bmiHeader.biHeight.abs();
        bmp_info.bmiHeader.biBitCount = 32;
        bmp_info.bmiHeader.biCompression = windows_sys::Win32::Graphics::Gdi::BI_RGB;
        bmp_info.bmiHeader.biHeight = -height;

        let pixel_count = (width * height * 4) as usize;
        let mut pixels: Vec<u8> = vec![0; pixel_count];

        windows_sys::Win32::Graphics::Gdi::GetDIBits(
            hdc,
            icon_info.hbmColor,
            0,
            height as u32,
            pixels.as_mut_ptr() as *mut _,
            &mut bmp_info,
            windows_sys::Win32::Graphics::Gdi::DIB_RGB_COLORS,
        );

        windows_sys::Win32::Graphics::Gdi::DeleteDC(hdc);
        if !icon_info.hbmColor.is_null() {
            windows_sys::Win32::Graphics::Gdi::DeleteObject(icon_info.hbmColor as _);
        }
        if !icon_info.hbmMask.is_null() {
            windows_sys::Win32::Graphics::Gdi::DeleteObject(icon_info.hbmMask as _);
        }
        windows_sys::Win32::UI::WindowsAndMessaging::DestroyIcon(hicon);

        for i in (0..pixel_count).step_by(4) {
            pixels.swap(i, i + 2);
        }

        let mut png_data: Vec<u8> = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut png_data, width as u32, height as u32);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            if let Ok(mut writer) = encoder.write_header() {
                let _ = writer.write_image_data(&pixels);
            }
        }

        let b64 = base64::engine::general_purpose::STANDARD.encode(&png_data);
        Some(format!("data:image/png;base64,{}", b64))
    }
}

#[cfg(not(target_os = "windows"))]
fn extract_exe_icon(_path: &str) -> Option<String> {
    None
}
