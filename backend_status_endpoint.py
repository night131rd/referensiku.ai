# Tambahkan endpoint status ini ke backend FastAPI

@router.get("/search/status/{task_id}")
async def get_search_status(task_id: str):
    """
    Mendapatkan status pencarian saat ini.
    """
    if task_id not in task_status:
        return JSONResponse(
            content={"detail": "Task not found"},
            status_code=HTTPStatus.NOT_FOUND
        )
    
    data = task_status.get(task_id)
    
    # Tentukan phase berdasarkan status data
    if data.get("bibliography_ready"):
        phase = "completed"
    elif data.get("answer_ready"):
        phase = "answer"
    elif data.get("sources_ready"):
        phase = "sources"
    else:
        phase = "waiting"
    
    return {
        "phase": phase,
        "answer": data.get("answer"),
        "sources": data.get("sources", []),
        "bibliography": data.get("bibliography", [])
    }
