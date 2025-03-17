FROM python:3.9-alpine

WORKDIR /app

COPY ./requirement.txt /requirement.txt

RUN pip install --no-cache-dir --upgrade -r /requirement.txt

COPY ./PSS /app

CMD ["fastapi", "run", "app.py", "--port", "8000"]