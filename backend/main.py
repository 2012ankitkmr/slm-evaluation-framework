from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import httpx
from datasets import load_dataset

app = FastAPI(title="SLM Eval Framework API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PromptConfig(BaseModel):
    id: Optional[str] = None
    name: str # e.g. "Evaluation Prompt (Default)"
    cot_content: str
    few_shot_content: str
    user_prompt_template: str # e.g. "Question: {{question}}\nChoices: {{choices}}\nAnswer:"
    is_default: bool = False

class EvaluationResult(BaseModel):
    id: str
    job_id: str
    model_name: str
    use_case_id: str
    prompt_id: str
    score: float
    timestamp: float

class UseCase(BaseModel):
    id: str
    name: str
    description: str
    dataset_count: int
    prompts: List[PromptConfig]
    dataset_source: Optional[str] = "mock" # "mock" or "hf:dataset_name"

class EvalRequest(BaseModel):
    model_name: str
    use_case_id: str
    prompt_id: str
class EvalRequest(BaseModel):
    model_name: str
    use_case_id: str
    prompt_id: str
    dataset_subset: Optional[str] = None # Added for completeness if needed later

class Job(BaseModel):
    id: str
    status: str # "running", "completed", "failed"
    progress: int # 0-100
    model_name: str
    use_case_id: str
    prompt_id: str
    result_id: Optional[str] = None
    created_at: float

# Mock Data
USE_CASES = [
    UseCase(
        id="GKH", 
        name="(GKH) General Knowledge Helper", 
        description="Evaluates ability to answer common sense questions using Chain of Thought.", 
        dataset_count=570,
        dataset_source="hf:ai2_arc:ARC-Easy",
        prompts=[
            PromptConfig(
                id="p1", 
                name="Evaluation Prompt (Default)", 
                cot_content="""You are an expert logic and reasoning assistant. Your goal is to answer questions accurately by first breaking down your reasoning process step-by-step.

Follow this format:
1. Analyze the Question: Identify the core question and any constraints.
2. Step-by-Step Reasoning: break down the problem. If it involves calculations, show them. If it involves facts, verify them in your internal knowledge.
3. Conclusion: Synthesize your reasoning.
4. Final Answer: Provide the direct answer to the question.

Always prioritize accuracy and clarity.""", 
                few_shot_content="""Q: Janet has 5 apples. She gives 2 to Tom and buys 3 more. How many apples does she have now?
Reasoning:
1. Start with 5 apples.
2. Subtract the 2 given to Tom: 5 - 2 = 3 apples.
3. Add the 3 purchased: 3 + 3 = 6 apples.
Answer: 6

Q: Which is heavier, a pound of lead or a pound of feathers?
Reasoning:
1. Compare the units of mass: both are exactly "one pound".
2. Mass is independent of density or volume.
3. Therefore, they have the same mass.
Answer: They are equal in weight.

Q: The day before yesterday was Saturday. What day will it be the day after tomorrow?
Reasoning:
1. If "day before yesterday" was Saturday, then yesterday was Sunday.
2. Today is Monday.
3. Tomorrow is Tuesday.
4. The day after tomorrow is Wednesday.
Answer: Wednesday""",
                user_prompt_template="""Question: {{question}}
Choices: {{choices}}
Reasoning:""",
                is_default=True
            )
        ]
    ),
    UseCase(
        id="CG", 
        name="(CG) Code Generator", 
        description="Tests Python coding capabilities.", 
        dataset_count=50,
        prompts=[
             PromptConfig(
                id="p2", 
                name="Evaluation Prompt (Default)", 
                is_default=True,
                cot_content="You are an expert programmer. Write code that solves the problem step by step.", 
                few_shot_content="# Example 1\n# Input: Reverse a string\n# Output: s[::-1]",
                user_prompt_template="# Input: {{question}}\n# Output:",
            )
        ]
    ),
    UseCase(
        id="ITAX", 
        name="(ITAX) Indian Personal Tax Assistant", 
        description="Evaluates understanding of Indian Income Tax laws, regulations, and personal tax queries for FY 2024-25.", 
        dataset_count=100,
        dataset_source="hf:msinankhan1/India_Tax_FAQs:default",
        prompts=[
            PromptConfig(
                id="p3", 
                name="Tax Expert Prompt (Default)", 
                cot_content="""You are an expert Indian Income Tax consultant with deep knowledge of:
- Income Tax Act, 1961
- Finance Act 2024-25
- Tax slabs, deductions (80C, 80D, HRA, etc.)
- Form 16, ITR filing procedures
- TDS, advance tax, and e-verification

When answering tax queries:
1. Clarify the Question: Identify the tax year, income sources, and specific regulations involved.
2. Apply Tax Rules: Reference relevant sections (e.g., Section 80C for deductions up to ₹1,50,000).
3. Calculate Step-by-Step: If amounts are involved, show calculations clearly.
4. Provide Context: Mention deadlines, forms required, or compliance steps.
5. Final Answer: Give a clear, actionable response.

Always prioritize accuracy and cite the Finance Act year when applicable.""", 
                few_shot_content="""Q: I invested ₹1,20,000 in PPF and ₹30,000 in ELSS. What is my total 80C deduction?
Reasoning:
1. Section 80C allows deductions up to ₹1,50,000 per financial year.
2. PPF contribution: ₹1,20,000
3. ELSS investment: ₹30,000
4. Total invested: ₹1,20,000 + ₹30,000 = ₹1,50,000
5. This is within the ₹1,50,000 limit.
Answer: Your total Section 80C deduction is ₹1,50,000 for FY 2024-25.

Q: My gross salary is ₹8,00,000. I have standard deduction. What is my taxable income?
Reasoning:
1. Gross Salary: ₹8,00,000
2. Standard Deduction (FY 2024-25): ₹50,000
3. Taxable Income = Gross Salary - Standard Deduction
4. ₹8,00,000 - ₹50,000 = ₹7,50,000
Answer: Your taxable income is ₹7,50,000 (before other deductions like 80C, 80D).

Q: What is the last date to file ITR for FY 2024-25?
Reasoning:
1. For salaried individuals (not requiring audit), the ITR filing deadline is typically July 31st.
2. For FY 2024-25 (AY 2025-26), the deadline is July 31, 2025.
3. Late filing attracts penalties under Section 234F.
Answer: July 31, 2025 is the last date to file ITR for FY 2024-25 (Assessment Year 2025-26) for salaried taxpayers.""",
                user_prompt_template="""Tax Query: {{question}}

Provide a detailed answer with calculations if applicable:""",
                is_default=True
            ),
            PromptConfig(
                id="p3_simple", 
                name="Simple Tax Advisor Prompt", 
                cot_content="""You are a helpful tax advisor for Indian taxpayers. Answer questions about:
- Income tax calculations
- Deductions and exemptions
- Form 16 and ITR filing
- TDS and tax payments

Keep answers clear, concise, and practical.""", 
                few_shot_content="""Q: How much can I save under 80C?
A: You can claim deductions up to ₹1,50,000 under Section 80C by investing in PPF, ELSS, EPF, life insurance, etc.

Q: What is standard deduction for FY 2024-25?
A: Standard deduction is ₹50,000 for salaried employees under the new tax regime.""",
                user_prompt_template="""Question: {{question}}
Answer:""",
                is_default=False
            )
        ]
    ),
]

def format_prompt(prompt_config: PromptConfig, sample: dict) -> str:
    """Combines CoT, Few-Shot, and Template into a single string."""
    system = prompt_config.cot_content
    examples = prompt_config.few_shot_content
    template = prompt_config.user_prompt_template
    
    # Simple replacement of {{key}} with values from sample
    formatted_user = template
    for key, value in sample.items():
        placeholder = f"{{{{{key}}}}}"
        if placeholder in formatted_user:
            # Handle list/dict values (like choices in ARC)
            str_val = str(value)
            if key == "choices":
                # Special formatting for AI2 ARC choices
                if isinstance(value, dict) and 'text' in value and 'label' in value:
                    str_val = "\n".join([f"{l}: {t}" for l, t in zip(value['label'], value['text'])])
            
            formatted_user = formatted_user.replace(placeholder, str_val)
            
    return f"{system}\n\n=== EXAMPLES ===\n{examples}\n\n=== TASK ===\n{formatted_user}"

async def call_ollama(model: str, prompt: str) -> str:
    """Calls Ollama generate API."""
    url = "http://localhost:11434/api/generate"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json={
                "model": model,
                "prompt": prompt,
                "stream": False
            })
            if response.status_code == 200:
                return response.json().get("response", "")
    except Exception as e:
        print(f"Ollama call failed: {e}")
    return ""

# Persistence configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
JOBS_FILE = os.path.join(DATA_DIR, "jobs.json")
RESULTS_FILE = os.path.join(DATA_DIR, "results.json")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def save_data(path, data_list):
    with open(path, "w") as f:
        json.dump([item.dict() for item in data_list], f, indent=2)

def load_data(path, model_class):
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r") as f:
            data = json.load(f)
            return [model_class(**item) for item in data]
    except Exception as e:
        print(f"Error loading {path}: {e}")
        return []

# Mock Job Store
JOBS: List[Job] = load_data(JOBS_FILE, Job)

# Mock Results Store
RESULTS: List[EvaluationResult] = load_data(RESULTS_FILE, EvaluationResult)

@app.get("/")
async def root():
    return {"message": "SLM Eval Framework API Running"}

@app.get("/use-cases", response_model=List[UseCase])
async def get_use_cases():
    return USE_CASES

@app.get("/use-cases/{use_case_id}/samples")
async def get_use_case_samples(use_case_id: str):
    """Fetch first 50 samples for a use case dataset."""
    for uc in USE_CASES:
        if uc.id == use_case_id:
            if uc.dataset_source.startswith("hf:"):
                try:
                    parts = uc.dataset_source.split(":")
                    dataset_name = parts[1]
                    config = parts[2] if len(parts) > 2 else None
                    
                    # Using 'validation' or 'test' split if available, else 'train'
                    ds = load_dataset(dataset_name, config, split='validation', trust_remote_code=True)
                    # Convert to list of dicts
                    return [row for row in ds.select(range(min(50, len(ds))))]
                except Exception as e:
                    print(f"Error loading explorer data: {e}")
                    raise HTTPException(status_code=500, detail=str(e))
            else:
                # Return mock samples
                return [
                    {"id": i, "question": f"Sample question {i} for {uc.name}", "answer": f"Sample answer {i}"}
                    for i in range(10)
                ]
    raise HTTPException(status_code=404, detail="Use case not found")

@app.post("/use-cases/{use_case_id}/prompts")
async def add_prompt(use_case_id: str, prompt: PromptConfig):
    for uc in USE_CASES:
        if uc.id == use_case_id:
            # Simple ID generation if not provided
            if not prompt.id:
                prompt.id = f"p_{len(uc.prompts) + 1}_{use_case_id}"
            uc.prompts.append(prompt)
            return prompt
    raise HTTPException(status_code=404, detail="Use case not found")

@app.delete("/use-cases/{use_case_id}/prompts/{prompt_id}")
async def delete_prompt(use_case_id: str, prompt_id: str):
    for uc in USE_CASES:
        if uc.id == use_case_id:
            for i, p in enumerate(uc.prompts):
                if p.id == prompt_id:
                    if p.is_default:
                        raise HTTPException(status_code=400, detail="Cannot delete default prompt")
                    uc.prompts.pop(i)
                    return {"status": "success", "id": prompt_id}
            raise HTTPException(status_code=404, detail="Prompt not found")
            raise HTTPException(status_code=404, detail="Prompt not found")
    raise HTTPException(status_code=404, detail="Use case not found")

@app.put("/use-cases/{use_case_id}/prompts/{prompt_id}")
async def update_prompt(use_case_id: str, prompt_id: str, updated_prompt: PromptConfig):
    for uc in USE_CASES:
        if uc.id == use_case_id:
            for i, p in enumerate(uc.prompts):
                if p.id == prompt_id:
                    if p.is_default:
                        raise HTTPException(status_code=400, detail="Cannot modify default prompt")
                    
                    # specific updates
                    p.name = updated_prompt.name
                    p.cot_content = updated_prompt.cot_content
                    p.few_shot_content = updated_prompt.few_shot_content
                    p.user_prompt_template = updated_prompt.user_prompt_template
                    
                    return p
            raise HTTPException(status_code=404, detail="Prompt not found")
    raise HTTPException(status_code=404, detail="Use case not found")

@app.get("/models")
async def get_models():
    """Fetch available models from local Ollama instance or fallback to mock data."""
    ollama_url = "http://localhost:11434/api/tags"
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(ollama_url)
            if response.status_code == 200:
                data = response.json()
                # Extract model names from Ollama response, filtering out tokenizers and embedding models
                return [
                    model["name"] for model in data.get("models", []) 
                    if not any(excluded in model["name"].lower() for excluded in ["tokeniser", "tokenizer", "embed"])
                ]
    except Exception as e:
        print(f"Ollama not reachable: {e}")
        
    # Fallback mock models
    return ["llama3:latest", "mistral:latest", "gemma:2b"]

@app.post("/evaluate")
async def run_evaluation(request: EvalRequest):
    import time
    import uuid
    import asyncio
    
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    job = Job(
        id=job_id,
        status="running",
        progress=0,
        model_name=request.model_name,
        use_case_id=request.use_case_id,
        prompt_id=request.prompt_id,
        created_at=time.time()
    )
    JOBS.append(job)
    save_data(JOBS_FILE, JOBS)
    
    # Simulate background task
    async def process_job(j: Job):
        # Find use case to get dataset source
        uc_source = "mock"
        selected_prompt = None
        for uc in USE_CASES:
            if uc.id == j.use_case_id:
                uc_source = uc.dataset_source
                # Find the prompt config
                for p in uc.prompts:
                    if p.id == j.prompt_id:
                        selected_prompt = p
                        break
                break

        if not selected_prompt:
            j.status = "failed"
            return

        samples = []
        if uc_source.startswith("hf:"):
            try:
                # Format: hf:dataset_name:config
                parts = uc_source.split(":")
                dataset_name = parts[1]
                config = parts[2] if len(parts) > 2 else None
                
                # Fetch a small split (e.g., validation or test) for evaluation
                ds = load_dataset(dataset_name, config, split='validation', trust_remote_code=True)
                # Take first 10 for evaluation
                samples = ds.select(range(min(10, len(ds))))
            except Exception as e:
                print(f"Error loading real dataset: {e}")
                # Fallback to dummy loop if HF fails
        
        correct_count = 0
        total_count = len(samples) if samples else 10
        
        for i in range(total_count):
            if samples:
                sample = samples[i]
                prompt = format_prompt(selected_prompt, sample)
                
                # Debug log for first prompt
                if i == 0:
                    print(f"DEBUG: Formatted Prompt example:\n{prompt}")
                
                # Real Ollama call
                response = await call_ollama(j.model_name, prompt)
                
                # Simple scoring (for multiple choice e.g. ARC)
                if 'answerKey' in sample:
                    expected = str(sample['answerKey']).strip().upper()
                    # Check if expected label is in the response (naive check)
                    # Often models output "The answer is A" or just "A"
                    if expected in response.upper():
                        correct_count += 1
            else:
                # Mock evaluation logic
                await asyncio.sleep(1)
                import random
                if random.random() > 0.3:
                    correct_count += 1
            
            j.progress = int(((i + 1) / total_count) * 100)
            save_data(JOBS_FILE, JOBS)
            
        j.status = "completed"
        # Create real result
        score = correct_count / total_count if total_count > 0 else 0
        result = EvaluationResult(
            id=f"res_{j.id}",
            job_id=j.id,
            model_name=j.model_name,
            use_case_id=j.use_case_id,
            prompt_id=j.prompt_id,
            score=score,
            timestamp=time.time()
        )
        RESULTS.append(result)
        save_data(RESULTS_FILE, RESULTS)
        j.result_id = result.id
        save_data(JOBS_FILE, JOBS)
        
    asyncio.create_task(process_job(job))
    
    return {"status": "started", "job_id": job_id}

@app.get("/results", response_model=List[EvaluationResult])
async def get_results():
    return sorted(RESULTS, key=lambda x: x.timestamp, reverse=True)

@app.get("/jobs", response_model=List[Job])
async def get_jobs():
    return sorted(JOBS, key=lambda x: x.created_at, reverse=True)

@app.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    for job in JOBS:
        if job.id == job_id:
            return job
    raise HTTPException(status_code=404, detail="Job not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
