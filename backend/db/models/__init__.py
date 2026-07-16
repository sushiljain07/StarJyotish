"""
Importing every model module here means a single `import db.models` (or
`from db.base import Base` after this package has been imported once)
gives Base.metadata a complete picture of the schema — required for both
Alembic's autogenerate and the dev-convenience Base.metadata.create_all()
path in db/seed.py.
"""
from db.base import Base  # noqa: F401
from db.models.astrologer import AstrologerProfile, KycStatus  # noqa: F401
from db.models.audit_log import AuditAction, AuditLog  # noqa: F401
from db.models.birth_profile import BirthProfile  # noqa: F401
from db.models.booking import Booking, BookingMode, BookingStatus  # noqa: F401
from db.models.chat import ChatMessage, ChatRole, ChatSession  # noqa: F401
from db.models.feedback import Feedback, FeedbackCategory  # noqa: F401
from db.models.testimonial import Testimonial, TestimonialStatus  # noqa: F401
from db.models.notification import Notification, NotificationChannel, NotificationStatus  # noqa: F401
from db.models.otp_code import OtpCode  # noqa: F401
from db.models.purchase import Purchase, PurchaseProductType, PurchaseStatus  # noqa: F401
from db.models.report import Report, ReportStatus, ReportType  # noqa: F401
from db.models.review import Review  # noqa: F401
from db.models.session import UserSession  # noqa: F401
from db.models.setting import AppSetting  # noqa: F401
from db.models.transaction import RelatedEntityType, Transaction, TransactionStatus, TransactionType  # noqa: F401
from db.models.user import User, UserRole  # noqa: F401
from db.models.user_memory import UserAiMemory  # noqa: F401
from db.models.wallet import Wallet, WalletLedgerDirection, WalletLedgerEntry  # noqa: F401

__all__ = [
    "Base",
    "User", "UserRole",
    "BirthProfile",
    "Report", "ReportType", "ReportStatus",
    "AstrologerProfile", "KycStatus",
    "Booking", "BookingMode", "BookingStatus",
    "Transaction", "TransactionType", "TransactionStatus", "RelatedEntityType",
    "Purchase", "PurchaseProductType", "PurchaseStatus",
    "Notification", "NotificationChannel", "NotificationStatus",
    "UserSession",
    "OtpCode",
    "Wallet", "WalletLedgerEntry", "WalletLedgerDirection",
    "Review",
    "AppSetting",
    "AuditLog", "AuditAction",
    "Feedback", "FeedbackCategory",
    "Testimonial", "TestimonialStatus",
    "ChatSession", "ChatMessage", "ChatRole",
    "UserAiMemory",
]
