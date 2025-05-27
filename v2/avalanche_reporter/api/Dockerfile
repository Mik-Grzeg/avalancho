FROM python:3.11-slim

# Install Poetry
RUN pip install --no-cache-dir poetry==1.7.1

# Disable Poetry's virtual-env creation inside the image
ENV POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

# Copy only pyproject & lock file first → better layer caching
COPY ./api/pyproject.toml .
# (optional) COPY poetry.lock .

# Install deps
RUN poetry install --no-root --no-interaction --no-ansi

# Copy application code
COPY ./api/app ./app
COPY ./shared ./app/shared

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
