# Ledger contract

When somebody downloads or clones their own island, a ledger starts.
It never leaves that island.

## What it collects

- Legendary titles
- Seat of each title on the rim (angle or free x,y)
- Phase: free / rect / white
- Date of first hang
- Jump notes when time skips
- Hash of the tucked raw (not the raw itself on the public surface)

## What it does not collect

- Patient files
- Secrets
- Original private GRECO build trees

## Birth rule

Clone = birth.
Birth writes row 0: island id, birth date, empty title list.
Every later hang appends. No rewrite of old rows.

This is the immutable ledger for this bay.
App data in `localStorage` is a preview of the same idea.
Production seat is a real append-only store when the island is no longer a demo.

## First nest

Canvas floats.
First nest downward = first pull of legendary words.
That pull is titles + approved bullets only.
Raw stays tucked until asked.
