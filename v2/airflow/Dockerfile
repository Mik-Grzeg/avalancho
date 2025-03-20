FROM apache/airflow:2.1.1

USER root

RUN apt-get update && apt-get install -y gcc g++

USER airflow

COPY ./requirements.txt .

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt