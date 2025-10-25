# RSS Feeds Setup Guide

## Overview
This project now includes comprehensive RSS feed configuration for multiple languages and categories to provide better article categorization and content organization.

## Features Implemented

### ✅ **Category System**
- **Smart Categorization**: Articles are automatically categorized based on content analysis
- **Categories Available**: Politics, Sports, Entertainment, Technology, Health, Business, Education, Crime
- **Language Support**: Telugu, Hindi, English, Tamil, Marathi, Bengali, Gujarati

### ✅ **UI Improvements**
- **Removed**: Pill-shaped category badges under language news sections
- **Added**: Category filtering buttons under each language news section
- **Enhanced**: Article categorization with meaningful category names instead of "General"

### ✅ **RSS Feed Configuration**
- **Multi-language Support**: RSS feeds configured for 7 languages
- **Category-based Feeds**: Each language has feeds for different categories
- **Image Support**: Feeds configured to include images for better categorization

## RSS Feeds Structure

### Languages Supported:
- **Telugu (te)**: Eenadu, Sakshi
- **Hindi (hi)**: Aaj Tak, Zee News  
- **English (en)**: Times of India, The Hindu
- **Tamil (ta)**: Dinamalar
- **Marathi (mr)**: Lokmat
- **Bengali (bn)**: Anandabazar
- **Gujarati (gu)**: Gujarat Samachar

### Categories per Language:
- Politics
- Sports
- Entertainment
- Technology
- Health
- Business
- Education (where available)
- Crime (where available)

## How to Load RSS Feeds

### Method 1: API Endpoint
```bash
curl -X POST http://localhost:3000/api/admin/rss-feeds/load
```

### Method 2: Using the Script
```bash
node src/scripts/load-rss-feeds.js
```

### Method 3: Admin Panel
1. Go to your admin panel
2. Navigate to RSS Feeds section
3. Click "Load Default Feeds" button

## Category Filtering

### Homepage
- Each language section now has category filter buttons
- Users can filter by: All, Politics, Sports, Entertainment, Technology, Health, Business
- Buttons link to filtered news pages

### News Pages
- Enhanced categorization system
- Articles automatically categorized based on content analysis
- Better category names instead of generic "General"

## Smart Categorization Algorithm

The system analyzes article content using keyword matching:

### Politics Keywords:
- politics, political, election, government, minister, chief minister, pm, president, parliament, assembly, vote, voting, party, congress, bjp, tdp, ysr, jagan, modi, rahul, trs, aap

### Sports Keywords:
- sports, cricket, football, tennis, badminton, hockey, olympics, world cup, ipl, bcci, match, player, team, score, tournament, championship, athlete, game, sport

### Entertainment Keywords:
- movie, film, cinema, actor, actress, director, bollywood, tollywood, kollywood, music, song, album, singer, dance, drama, theater, entertainment, celebrity, star, hero, heroine

### Technology Keywords:
- technology, tech, computer, software, app, mobile, phone, internet, ai, artificial intelligence, robot, digital, cyber, hacking, startup, innovation, gadget, device, smartphone, laptop

### Health Keywords:
- health, medical, doctor, hospital, medicine, disease, covid, corona, vaccine, treatment, surgery, patient, clinic, pharmacy, drug, therapy, wellness, fitness, nutrition, diet

### Business Keywords:
- business, economy, economic, market, stock, share, company, corporate, finance, banking, investment, profit, loss, revenue, trade, commerce, industry, manufacturing, export, import

### Education Keywords:
- education, school, college, university, student, teacher, exam, result, admission, course, degree, study, learning, academic, institute, training, scholarship, tuition

### Crime Keywords:
- crime, police, murder, theft, robbery, fraud, scam, arrest, jail, court, law, legal, criminal, investigation, case, trial, judge, lawyer, justice

## File Structure

```
src/
├── data/
│   └── rss-feeds.json          # RSS feed configuration
├── scripts/
│   └── load-rss-feeds.js       # Script to load feeds
├── app/
│   ├── page.tsx                # Homepage with category buttons
│   ├── news/
│   │   └── page.tsx            # News page with enhanced categorization
│   └── api/
│       └── admin/
│           └── rss-feeds/
│               └── load/
│                   └── route.ts # API to load RSS feeds
```

## Next Steps

1. **Load RSS Feeds**: Use one of the methods above to load the configured feeds
2. **Test Categorization**: Check that articles are properly categorized
3. **Add More Feeds**: Extend the RSS feeds configuration as needed
4. **Monitor Performance**: Ensure the categorization system works efficiently

## Benefits

- **Better User Experience**: Users can easily filter news by category
- **Improved Organization**: Articles are properly categorized instead of showing "General"
- **Multi-language Support**: Comprehensive coverage across Indian languages
- **Scalable System**: Easy to add new languages and categories
- **Smart Categorization**: Automatic content analysis for better categorization
