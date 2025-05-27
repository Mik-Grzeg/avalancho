"""
SQLAlchemy ORM models for the avalanche reporter.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Float,
    ForeignKey,
    MetaData,
    DateTime,
)
from sqlalchemy.ext.declarative import declarative_base
import json

Base = declarative_base()


class ModelMixin:
    """Mixin class adding methods for better display and debugging of models."""

    def __repr__(self):
        """Default string representation with main attributes."""
        attr_list = []
        for key, value in self.__dict__.items():
            if not key.startswith("_"):
                # Format value properly based on type
                if isinstance(value, str):
                    val_repr = f"'{value}'"
                else:
                    val_repr = str(value)
                attr_list.append(f"{key}={val_repr}")

        return f"<{self.__class__.__name__}({', '.join(attr_list)})>"

    def to_dict(self):
        """Convert the model to a dictionary."""
        result = {}
        for key, value in self.__dict__.items():
            if not key.startswith("_"):
                result[key] = value
        return result

    def pretty_print(self):
        """Pretty print all fields of the model."""
        print(f"\n=== {self.__class__.__name__} ===")
        for key, value in self.__dict__.items():
            if not key.startswith("_"):
                print(f"{key}: {value}")
        print("=" * (len(self.__class__.__name__) + 6))


class Report(Base, ModelMixin):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    iss = Column(String)
    sub = Column(String)
    iat = Column(DateTime)
    exp = Column(DateTime, index=True)  # Added index for better querying performance
    iby = Column(String)
    crc = Column(String)
    comment = Column(String)
    rights = Column(String)
    pdf_key = Column(String)
    html_key = Column(String)

    # Master section
    mst_lev = Column(Integer)
    mst_wet = Column(String)
    mst_tnd = Column(Integer)
    mst_img = Column(String)
    mst_desc0 = Column(String)
    mst_desc1 = Column(String)
    mst_desc2 = Column(String)
    mst_desc0_a = Column(String)

    # AM section
    am_mode = Column(Integer)
    am_height = Column(Integer)
    am_img = Column(String)
    am_upper_lev = Column(Integer)
    am_upper_wet = Column(String)
    am_upper_prb = Column(String)
    am_upper_exp = Column(String)
    am_lower_lev = Column(Integer)
    am_lower_wet = Column(String)
    am_lower_prb = Column(String)
    am_lower_exp = Column(String)

    # PM section
    pm_mode = Column(Integer)
    pm_height = Column(Integer)
    pm_img = Column(String)
    pm_upper_lev = Column(Integer)
    pm_upper_wet = Column(String)
    pm_upper_prb = Column(String)
    pm_upper_exp = Column(String)
    pm_lower_lev = Column(Integer)
    pm_lower_wet = Column(String)
    pm_lower_prb = Column(String)
    pm_lower_exp = Column(String)


class History(Base, ModelMixin):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    dat = Column(DateTime)
    lev = Column(String)
    wet = Column(String)


# For backward compatibility with existing code
metadata = Base.metadata
reports = Report.__table__
history = History.__table__
