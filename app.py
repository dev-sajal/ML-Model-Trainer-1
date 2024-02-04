from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

from model import GenericModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ModelSchema(BaseModel):
    algo_name: str
    filepath: str
    target_var: str
    test_size: Optional[float] = 0.2
   


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/generate")
async def generate_report(schema: ModelSchema):
    model = GenericModel(**schema.dict())
    reports = model.run()
    return reports
# Add OPTIONS support for the "/generate" endpoint
@app.options("/generate")
async def options_generate():
    return {"allow": "POST, OPTIONS"}

if __name__ == "__main__":
    uvicorn.run(app)
