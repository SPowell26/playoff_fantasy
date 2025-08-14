# ESPN API Response Structure Files

This directory contains comprehensive response structure files for all major ESPN API endpoints and Fantasy API views used in the Fantasy Playoff Football application.

## 📁 **Core NFL APIs**

### **Player Data**
- **`nfl-athletes-response.json`** - Primary NFL athletes endpoint (`partners.api.espn.com`)
- **`sports-core-athletes-response.json`** - Alternative athletes endpoint (`sports.core.api.espn.com`)

### **Game & Schedule Data**
- **`nfl-events-response.json`** - NFL game events and schedules
- **`nfl-scoreboard-response.json`** - Current week status and live scores

## 🏈 **Fantasy API Views**

### **Statistics & Scoring**
- **`fantasy-mboxscore-response.json`** - Detailed player statistics (most comprehensive)
- **`fantasy-mlivescoring-response.json`** - Real-time live scoring updates
- **`fantasy-mmatchup-response.json`** - Game-by-game player performance
- **`fantasy-mmatchupscore-response.json`** - Matchup scoring with variance data

### **Roster & Team Management**
- **`fantasy-mroster-response.json`** - Roster composition and management
- **`fantasy-mteam-response.json`** - Team information and assignments
- **`fantasy-mstandings-response.json`** - League standings and rankings

### **Draft & Player Info**
- **`fantasy-mdraftdetail-response.json`** - Draft information and rankings
- **`fantasy-kona-player-info-response.json`** - Enhanced player metadata
- **`fantasy-player-wl-response.json`** - Player win/loss data

### **Complete Data**
- **`fantasy-allon-response.json`** - All available player data (most comprehensive view)

## 🎯 **Key Features of Each File**

### **Response Structure**
- ✅ **Actual JSON responses** from ESPN APIs (not mock data)
- ✅ **Real data examples** with actual player information
- ✅ **Complete field mappings** for every important data point

### **Documentation**
- 📋 **Field descriptions** for every key field
- 🔍 **Nested field paths** (e.g., `stats[].scoringPeriodId`)
- 💡 **Use cases** for each endpoint/view
- 🎯 **ESPN Stat ID mappings** for fantasy calculations

### **Data Quality**
- 📊 **Real response sizes** and data completeness
- 🔧 **Integration examples** for development
- ⚠️ **Notes and warnings** about endpoint reliability

## 🚀 **How to Use These Files**

### **For Development**
1. **Reference the exact data structure** when building integrations
2. **Understand field relationships** and nested objects
3. **Map ESPN data** to your database schema
4. **Handle edge cases** based on real API responses

### **For Testing**
1. **Validate API responses** against expected structure
2. **Debug data issues** with real examples
3. **Understand data quality** and completeness
4. **Test error handling** with actual response formats

### **For Documentation**
1. **API reference** for your development team
2. **Field mapping guide** for data transformations
3. **Integration examples** for future development
4. **Troubleshooting guide** for common issues

## 📊 **Data Richness Comparison**

| View | Data Size | Key Features | Best For |
|------|-----------|--------------|----------|
| `allon` | 3.2M chars | Complete player profiles, variance data | Comprehensive analysis |
| `mBoxscore` | 401K chars | Detailed statistics, all stat types | Fantasy scoring |
| `mLiveScoring` | 397K chars | Real-time updates, live data | Live applications |
| `mRoster` | 426K chars | Roster management, ownership data | Team management |
| `mMatchupScore` | 398K chars | Variance analysis, consistency metrics | Advanced analytics |

## 🔗 **Related Files**

- **`espn-api-reference.txt`** - Complete API reference guide
- **`espn-api-data-mapping.md`** - Detailed endpoint analysis
- **`espn-api-testing-summary.md`** - Testing results and insights

---

*Last Updated: August 11, 2025*  
*Total Files: 15 response structure files*  
*Coverage: All major ESPN APIs + All Fantasy views*
