from fastapi import APIRouter, HTTPException
from typing import Optional
from database import get_connection
from models import ItemIn, ItemOut

router = APIRouter()

@router.get("/items", response_model=list[ItemOut])
def get_items(search: Optional[str] = None,
              status: Optional[str] = None,
              category: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM items WHERE 1=1"
    params = []
    if search:
        like = f"%{search}%"
        query += " AND (name LIKE %s OR sku LIKE %s OR supplier LIKE %s OR notes LIKE %s)"
        params += [like, like, like, like]
    if status:
        query += " AND status = %s"
        params.append(status)
    if category:
        query += " AND category = %s"
        params.append(category)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

@router.get("/items/{item_id}", response_model=ItemOut)
def get_item(item_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM items WHERE id = %s", (item_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    return row

@router.post("/items", response_model=ItemOut, status_code=201)
def create_item(item: ItemIn):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO items (name, sku, category, status, quantity, supplier, location, updated, notes) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (item.name, item.sku, item.category, item.status, item.quantity,
         item.supplier, item.location, item.updated, item.notes)
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {**item.model_dump(), "id": new_id}

@router.put("/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, item: ItemIn):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE items SET name=%s, sku=%s, category=%s, status=%s, quantity=%s, "
        "supplier=%s, location=%s, updated=%s, notes=%s WHERE id=%s",
        (item.name, item.sku, item.category, item.status, item.quantity,
         item.supplier, item.location, item.updated, item.notes, item_id)
    )
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()
    if affected == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {**item.model_dump(), "id": item_id}

@router.delete("/items/{item_id}")
def delete_item(item_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM items WHERE id = %s", (item_id,))
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()
    if affected == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "deleted"}
