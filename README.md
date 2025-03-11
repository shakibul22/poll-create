# PollVanish - Anonymous Poll Creator

![PollVanish Banner](https://sjc.microlink.io/MrQJPKZDfNoQBtb8fJamLqYfV9-u8eBE24DPwZdaMQkeu_7nw4JgoKuX-yB1xMimdaab7UYiI6Qvo03DWL_qwg.jpeg)

PollVanish is an open-source web application that allows users to create anonymous polls that disappear after a set time. No login required, and results are only visible until the poll expires.

## 🚀 Features

### Core Features
- **Create & Share Polls**
  - Create multiple-choice or yes/no polls
  - Each poll gets a unique link for sharing
  - Polls expire after a set time (1 hour, 12 hours, 24 hours)

- **Vote & View Results**
  - Anonymous voting system
  - Option to hide results until the poll ends
  - Real-time results display
  - Reactions (🔥 Trending, 👍 Like)

- **Privacy & Simplicity**
  - No login required
  - Polls can be private (only accessible via link)
  - Data automatically deleted after expiration

- **Bonus Features**
  - Anonymous comments under polls
  - Dark/light mode toggle

## 🛠️ Technologies Used

- **Frontend**: Next.js with App Router, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18.x or higher
- MongoDB database (local or Atlas)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shakibul22/poll-create.git
   cd poll-create
   npm install
   npm run dev
