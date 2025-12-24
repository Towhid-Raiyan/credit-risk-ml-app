from pydantic import BaseModel

class CreditInput(BaseModel):
    Age: int
    Credit_amount: float
    Duration: int
    Sex: str                 # male / female
    Job: int                 # 0,1,2,3
    Housing: str             # own / rent / free
    Saving_accounts: str     # little / moderate / rich / unknown
    Purpose: str             # car / education / furniture / radio_TV / repairs
