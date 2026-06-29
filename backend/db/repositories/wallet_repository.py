import uuid
from typing import Optional

from sqlalchemy import select

from db.models.wallet import Wallet, WalletLedgerDirection, WalletLedgerEntry
from db.repositories.base_repository import BaseRepository


class InsufficientBalanceError(Exception):
    pass


class WalletRepository(BaseRepository[Wallet]):
    model = Wallet

    def get_by_user_id(self, user_id: uuid.UUID) -> Optional[Wallet]:
        stmt = select(Wallet).where(Wallet.user_id == user_id)
        return self.db.scalars(stmt).first()

    def get_or_create_for_user(self, user_id: uuid.UUID) -> Wallet:
        wallet = self.get_by_user_id(user_id)
        if wallet is not None:
            return wallet
        return self.create(user_id=user_id)

    def credit(
        self, wallet: Wallet, amount: float, reason: str, *, transaction_id: Optional[uuid.UUID] = None
    ) -> Wallet:
        """Increases the balance and writes the matching ledger row in the
        same flush — see wallet.py's module docstring for why these two
        writes must never happen independently."""
        if amount <= 0:
            raise ValueError("credit amount must be positive")
        new_balance = wallet.balance + amount
        self.update(wallet, balance=new_balance)
        self.db.add(WalletLedgerEntry(
            wallet_id=wallet.id,
            direction=WalletLedgerDirection.credit,
            amount=amount,
            balance_after=new_balance,
            reason=reason,
            transaction_id=transaction_id,
        ))
        self.db.flush()
        return wallet

    def debit(
        self, wallet: Wallet, amount: float, reason: str, *, transaction_id: Optional[uuid.UUID] = None
    ) -> Wallet:
        if amount <= 0:
            raise ValueError("debit amount must be positive")
        if wallet.balance < amount:
            raise InsufficientBalanceError(
                f"wallet {wallet.id} has balance {wallet.balance}, cannot debit {amount}"
            )
        new_balance = wallet.balance - amount
        self.update(wallet, balance=new_balance)
        self.db.add(WalletLedgerEntry(
            wallet_id=wallet.id,
            direction=WalletLedgerDirection.debit,
            amount=amount,
            balance_after=new_balance,
            reason=reason,
            transaction_id=transaction_id,
        ))
        self.db.flush()
        return wallet
