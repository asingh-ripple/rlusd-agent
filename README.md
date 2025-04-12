# 🚀 RLUSD Project

RLUSD (Real-time Liquidity for Urgent Situation Disbursement) is a blockchain-based system for managing and disbursing donations in emergency situations.

## ✨ Features

- 💰 Real-time donation tracking and disbursement
- ⛓️ XRPL integration for secure transactions
- 🤝 Multi-donor support with automatic disbursement calculation
- 🔌 RESTful API for easy integration
- 📊 Comprehensive transaction history and tracing

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/rlusd-agent.git
cd rlusd-agent
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up the database:

```bash
python -m db.setup_db
```

## 🚀 Usage

1. Start the API server:

```bash
python -m service.api_server
```

2. Access the API documentation:

- 📚 Swagger UI: http://localhost:8000/docs
- 📖 ReDoc: http://localhost:8000/redoc

## 🔌 API Endpoints

- 💸 `/disburse`: Execute payment transactions
- 🎁 `/donate`: Register new donations
- 👥 `/customers`: Manage customer information
- 🔍 `/payment-trace`: Track payment history
- 📈 `/analyze`: Process disaster analysis requests

## 🧪 Development

1. Run tests:

```bash
python -m pytest tests/
```

2. Seed sample data:

```bash
python -m db.seed_donations
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ⛓️ XRPL Foundation for blockchain infrastructure
- ⚡ FastAPI for the web framework
- 🗄️ SQLAlchemy for database management
