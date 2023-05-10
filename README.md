 # wildfire-tracker
 Web app for tracking wildfires and wildfire smoke in B.C.

Based off of current fire locations found at: `https://catalogue.data.gov.bc.ca/dataset/fire-locations-current`

Evacs & alerts data: is sources from ArcGIS polygon layer: `https://governmentofbc.maps.arcgis.com/home/item.html?id=acf47697c83748b8ab4e196ec14f9fdd` updates at least once per day & at least 4x per day during peak season.

Fire smoke data from firesmoke.ca.
fire-smoke.js pulls png from kmz file hosted on firesmoke, reprojects to EPSG:3857 & uploads to digiO.,

### 
Data is pulled from `bc-wildfire-scraper` github repo: https://github.com/vs-postmedia/bc-wildfire-scraper



###
EMBED
[protected-iframe info="https://vs-postmedia.github.io/wildfire-tracker-v3/" height="700"]
