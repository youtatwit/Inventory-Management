from pydantic import BaseModel
from typing import Optional
from datetime import date

class ItemIn(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    status: str = "Active"
    quantity: int = 0
    supplier: Optional[str] = None
    location: Optional[str] = None
    updated: Optional[date] = None
    notes: Optional[str] = None

class ItemOut(ItemIn):
    id: int
