"""
ADD THIS CODE to the bottom of: backend/routes/kundli.py
(paste it just before the last line, or at the very end of the file)
"""

# ─── NEW IMPORT — add this at the TOP of kundli.py with other imports ───────
# from services.divisional_charts import calculate_divisional_chart
# ────────────────────────────────────────────────────────────────────────────


# ─── NEW MODEL — add this to backend/models/chart_data.py ───────────────────
# class DivisionalRequest(BaseModel):
#     date: str
#     time: str
#     place: str
#     division: int = 1
# ────────────────────────────────────────────────────────────────────────────


@router.post("/kundli/divisional")
def get_divisional_chart(body: BirthInput, division: int = 1):
    """
    Get any divisional chart D1–D60.
    Pass ?division=9 for D9, ?division=10 for D10, etc.
    """
    from services.divisional_charts import calculate_divisional_chart

    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

    result = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, division)
    return result
