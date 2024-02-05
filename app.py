from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


@app.post("/generate")
async def generate_report(
    algo_name: str = Form(...),
    target_var: str = Form(...),
    file: UploadFile = File(...),
    test_size: float = Form(0.2),
):
    model = GenericModel(
        algo_name=algo_name,
        file=file.file,
        target_var=target_var,
        test_size=test_size,
    )
    reports = model.run()
    return JSONResponse(content=reports)


if __name__ == "__main__":
    uvicorn.run("app:app", reload=True)
