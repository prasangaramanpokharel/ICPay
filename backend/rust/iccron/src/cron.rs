use crate::types::CompiledCron;

pub fn parse_cron(expression: &str) -> Result<CompiledCron, String> {
    let expr = expression.trim();
    let normalized = match expr {
        "@yearly" | "@annually" => "0 0 1 1 *",
        "@monthly" => "0 0 1 * *",
        "@weekly" => "0 0 * * 0",
        "@daily" | "@midnight" => "0 0 * * *",
        "@hourly" => "0 * * * *",
        other => other,
    };

    let fields: Vec<&str> = normalized.split_whitespace().collect();
    if fields.len() != 5 {
        return Err(format!(
            "Invalid cron expression '{}': expected 5 fields (minute hour day month weekday)",
            expression
        ));
    }

    let minutes = parse_field(fields[0], 0, 59)? as u64;
    let hours = parse_field(fields[1], 0, 23)? as u32;
    let days = parse_field(fields[2], 1, 31)? as u32;
    let months = parse_field(fields[3], 1, 12)? as u16;
    let weekdays = parse_weekday_field(fields[4])? as u8;

    Ok(CompiledCron {
        minutes,
        hours,
        days,
        months,
        weekdays,
    })
}

fn parse_field(field: &str, min: u32, max: u32) -> Result<u64, String> {
    let mut mask: u64 = 0;
    for part in field.split(',') {
        let p = part.trim();
        if p.is_empty() {
            continue;
        }

        let (range_str, step) = if let Some((r, s)) = p.split_once('/') {
            let step_val = s
                .parse::<u32>()
                .map_err(|_| format!("Invalid step '{s}' in field '{field}'"))?;
            if step_val == 0 {
                return Err("Step cannot be zero".to_string());
            }
            (r, step_val)
        } else {
            (p, 1)
        };

        let (start, end) = if range_str == "*" {
            (min, max)
        } else if let Some((a, b)) = range_str.split_once('-') {
            let s = a
                .parse::<u32>()
                .map_err(|_| format!("Invalid range start '{a}'"))?;
            let e = b
                .parse::<u32>()
                .map_err(|_| format!("Invalid range end '{b}'"))?;
            if s > e || s < min || e > max {
                return Err(format!("Range '{range_str}' out of bounds ({min}-{max})"));
            }
            (s, e)
        } else {
            let val = range_str
                .parse::<u32>()
                .map_err(|_| format!("Invalid value '{range_str}' in field '{field}'"))?;
            if val < min || val > max {
                return Err(format!("Value {val} out of bounds ({min}-{max})"));
            }
            (val, val)
        };

        let mut curr = start;
        while curr <= end {
            mask |= 1u64 << curr;
            curr += step;
        }
    }

    if mask == 0 {
        return Err(format!("Empty match set for field '{field}'"));
    }
    Ok(mask)
}

fn parse_weekday_field(field: &str) -> Result<u64, String> {
    let mut mask: u64 = 0;
    for part in field.split(',') {
        let p = part.trim();
        if p == "*" {
            return Ok(0x7F); // bits 0..=6 set
        }

        let (range_str, step) = if let Some((r, s)) = p.split_once('/') {
            let step_val = s.parse::<u32>().map_err(|_| format!("Invalid step '{s}'"))?;
            (r, step_val.max(1))
        } else {
            (p, 1)
        };

        let (start, end) = if range_str == "*" {
            (0, 6)
        } else if let Some((a, b)) = range_str.split_once('-') {
            (parse_single_weekday(a)?, parse_single_weekday(b)?)
        } else {
            let d = parse_single_weekday(range_str)?;
            (d, d)
        };

        let mut curr = start;
        while curr <= end {
            mask |= 1u64 << (curr % 7);
            curr += step;
        }
    }
    Ok(mask)
}

fn parse_single_weekday(s: &str) -> Result<u32, String> {
    match s.trim().to_ascii_lowercase().as_str() {
        "0" | "7" | "sun" => Ok(0),
        "1" | "mon" => Ok(1),
        "2" | "tue" => Ok(2),
        "3" | "wed" => Ok(3),
        "4" | "thu" => Ok(4),
        "5" | "fri" => Ok(5),
        "6" | "sat" => Ok(6),
        other => Err(format!("Invalid weekday '{other}'")),
    }
}

pub fn next_run_timestamp(compiled: &CompiledCron, from_ts_sec: u64) -> Option<u64> {
    let mut candidate = (from_ts_sec / 60) * 60 + 60;
    let limit = candidate + (366 * 86400);

    while candidate <= limit {
        let (year, month, day, hour, minute, weekday) = utc_components(candidate);

        if (compiled.months & (1u16 << month)) == 0 {
            candidate = next_month_start(year, month);
            continue;
        }

        let day_matches = (compiled.days & (1u32 << day)) != 0;
        let weekday_matches = (compiled.weekdays & (1u8 << weekday)) != 0;

        let date_matches = if compiled.days == 0xFFFF_FFFE {
            weekday_matches
        } else if compiled.weekdays == 0x7F {
            day_matches
        } else {
            day_matches || weekday_matches
        };

        if !date_matches {
            candidate += 86400 - (candidate % 86400);
            continue;
        }

        if (compiled.hours & (1u32 << hour)) == 0 {
            candidate += 3600 - (candidate % 3600);
            continue;
        }

        if (compiled.minutes & (1u64 << minute)) != 0 {
            return Some(candidate);
        }

        candidate += 60;
    }

    None
}

pub fn current_month_epoch(ts_sec: u64) -> u32 {
    let (year, month, _, _, _, _) = utc_components(ts_sec);
    (year as u32) * 100 + month
}

pub fn utc_components(ts_sec: u64) -> (i32, u32, u32, u32, u32, u32) {
    let minute = ((ts_sec / 60) % 60) as u32;
    let hour = ((ts_sec / 3600) % 24) as u32;
    let days_since_epoch = (ts_sec / 86400) as i64;
    let weekday = ((days_since_epoch + 4) % 7) as u32;

    let (year, month, day) = civil_from_days(days_since_epoch);
    (year, month, day, hour, minute, weekday)
}

fn civil_from_days(days: i64) -> (i32, u32, u32) {
    let z = days + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = (z - era * 146097) as u32;
    let yoe = (doe - doe / 1024 + doe / 1461 - doe / 14244) / 365;
    let y = (yoe as i64) + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y as i32, m, d)
}

fn days_from_civil(y: i32, m: u32, d: u32) -> i64 {
    let y = if m <= 2 { y - 1 } else { y } as i64;
    let m = m as i64;
    let d = d as i64;
    let era = if y >= 0 { y } else { y - 399 } / 400;
    let yoe = y - era * 400;
    let doy = (153 * (if m > 2 { m - 3 } else { m + 9 }) + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146097 + doe - 719468
}

fn next_month_start(year: i32, month: u32) -> u64 {
    let (next_year, next_month) = if month == 12 {
        (year + 1, 1)
    } else {
        (year, month + 1)
    };
    let days = days_from_civil(next_year, next_month, 1);
    (days as u64) * 86400
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_presets() {
        assert!(parse_cron("* * * * *").is_ok());
        assert!(parse_cron("*/5 * * * *").is_ok());
        assert!(parse_cron("@daily").is_ok());
        assert!(parse_cron("@hourly").is_ok());
        assert!(parse_cron("@weekly").is_ok());
        assert!(parse_cron("@monthly").is_ok());
    }

    #[test]
    fn test_next_run_every_five_minutes() {
        let compiled = parse_cron("*/5 * * * *").unwrap();
        let now = 1700000010;
        let next = next_run_timestamp(&compiled, now).unwrap();
        assert_eq!(next % 300, 0);
        assert!(next > now);
    }

    #[test]
    fn test_specific_time_daily() {
        let compiled = parse_cron("30 14 * * *").unwrap();
        let now = 1700000000;
        let next = next_run_timestamp(&compiled, now).unwrap();
        let (_, _, _, hour, minute, _) = utc_components(next);
        assert_eq!(hour, 14);
        assert_eq!(minute, 30);
    }

    #[test]
    fn test_weekday_filter() {
        // Run only on weekdays Mon-Fri (1-5)
        let compiled = parse_cron("0 12 * * 1-5").unwrap();
        let now = 1700000000;
        let next = next_run_timestamp(&compiled, now).unwrap();
        let (_, _, _, hour, minute, weekday) = utc_components(next);
        assert_eq!(hour, 12);
        assert_eq!(minute, 0);
        assert!(weekday >= 1 && weekday <= 5);
    }

    #[test]
    fn test_current_month_epoch() {
        let ts = 1731000000; // Nov 2024
        let epoch = current_month_epoch(ts);
        assert_eq!(epoch, 202411);
    }
}
