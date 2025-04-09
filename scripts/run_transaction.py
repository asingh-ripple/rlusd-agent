#!/usr/bin/env python3
"""
Script to run the XRPL transaction function.
"""

import asyncio
from blockchain.transaction import main

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nTransaction cancelled by user")
    except Exception as e:
        print(f"Error running transaction: {e}") 