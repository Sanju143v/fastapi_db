
import importlib

dependencies = [
    "fastapi",
    "uvicorn",
    "sqlalchemy",
    "psycopg2",
    "dotenv",
    "jose",
    "pydantic",
    "azure.ai.inference",
    "azure.core",
    "smtplib",
    "email.message"
]

missing = []

for dep in dependencies:
    try:
        importlib.import_module(dep.split('.')[0] if '.' in dep else dep)
        print(f"✅ {dep} is installed")
    except ImportError:
        print(f"❌ {dep} is NOT installed")
        missing.append(dep)

if missing:
    print(f"\nMissing dependencies: {', '.join(missing)}")
else:
    print("\nAll core dependencies are installed!")
