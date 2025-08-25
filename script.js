// Global variables
let map;
let stationsCoords = {};
let linesData = {};
let lineColors = {};
let allStations = [];
let journeysData = []; // To store journeys from CSV
let routeLayerGroup, markerLayerGroup, highlightLayer, networkLinesLayerGroup;
let currentPopupState = { journeys: [], index: 0, layer: null };
let lineLayers = {}; // To hold the leaflet layers for each tube line path

// DOM Elements
const startStationSelect = document.getElementById('start-station');
const endStationSelect = document.getElementById('end-station');
const findRouteBtn = document.getElementById('find-route-btn');
const lineStatusContainer = document.getElementById('line-status');
const routeInfoContainer = document.getElementById('route-info-container');
const routeInfoDiv = document.getElementById('route-info');
const csvUploadInput = document.getElementById('csv-upload');

// --- DATA ---

const LOCAL_LINE_COLORS_DATA = {
    "bakerloo": { name: "Bakerloo", color: "#B36305" },
    "central": { name: "Central", color: "#E32017" },
    "circle": { name: "Circle", color: "#FFD300" },
    "district": { name: "District", color: "#00782A" },
    "hammersmith-and-city": { name: "Hammersmith & City", color: "#F3A9BB" },
    "jubilee": { name: "Jubilee", color: "#A0A5A9" },
    "metropolitan": { name: "Metropolitan", color: "#9B0056" },
    "northern": { name: "Northern", color: "#000000" },
    "piccadilly": { name: "Piccadilly", color: "#003688" },
    "victoria": { name: "Victoria", color: "#0098D4" },
    "waterloo-and-city": { name: "Waterloo & City", color: "#95CDBA" },
    "dlr": { name: "DLR", color: "#00A4A7" },
    "elizabeth-line": { name: "Elizabeth line", color: "#6950a1" },
    "liberty": { name: "Liberty", color: "#676767" },
    "lioness": { name: "Lioness", color: "#f1b41c" },
    "mildmay": { name: "Mildmay", color: "#437ec1" },
    "suffragette": { name: "Suffragette", color: "#39b97a" },
    "weaver": { name: "Weaver", color: "#972861" },
    "windrush": { name: "Windrush", color: "#ef4d5e" },
    "interchange": { name: "Interchange", color: "#f0f0f0" }
};

// V4: Added Elizabeth Line to Reading, corrected station coordinates, and fixed DLR link.
const LOCAL_NETWORK_DATA = {
    "nodes": [{"id": 0, "name": "Acton Town", "position": [-0.280303,51.503071]}, {"id": 1, "name": "Aldgate", "position": [-0.075627,51.514342]}, {"id": 2, "name": "Aldgate East", "position": [-0.073001,51.515082]}, {"id": 3, "name": "Alperton", "position": [-0.299516,51.541209]}, {"id": 4, "name": "Amersham", "position": [-0.606514,51.674128]}, {"id": 5, "name": "Angel", "position": [-0.105581,51.532968]}, {"id": 6, "name": "Archway", "position": [-0.135122,51.56549]}, {"id": 7, "name": "Arnos Grove", "position": [-0.13427,51.61623]}, {"id": 8, "name": "Arsenal", "position": [-0.1055,51.558541]}, {"id": 9, "name": "Baker Street", "position": [-0.156904,51.523129]}, {"id": 10, "name": "Balham", "position": [-0.152685,51.443182]}, {"id": 11, "name": "Bank", "position": [-0.089,51.513347]}, {"id": 12, "name": "Barbican", "position": [-0.097722,51.520215]}, {"id": 13, "name": "Barking", "position": [0.080832,51.539521]}, {"id": 14, "name": "Barkingside", "position": [0.088477,51.585851]}, {"id": 15, "name": "Barons Court", "position": [-0.21343,51.490228]}, {"id": 16, "name": "Bayswater", "position": [-0.187902,51.512111]}, {"id": 17, "name": "Becontree", "position": [0.12688,51.539586]}, {"id": 18, "name": "Belsize Park", "position": [-0.163974,51.550191]}, {"id": 19, "name": "Bermondsey", "position": [-0.06433,51.497961]}, {"id": 20, "name": "Bethnal Green", "position": [-0.055392,51.527192]}, {"id": 21, "name": "Blackfriars", "position": [-0.102995,51.511587]}, {"id": 22, "name": "Blackhorse Road", "position": [-0.039626,51.585777]}, {"id": 23, "name": "Bond Street", "position": [-0.149614,51.513797]}, {"id": 24, "name": "Borough", "position": [-0.094197,51.501049]}, {"id": 25, "name": "Boston Manor", "position": [-0.324747,51.495765]}, {"id": 26, "name": "Bounds Green", "position": [-0.124177,51.607032]}, {"id": 27, "name": "Bow Road", "position": [-0.02436,51.527042]}, {"id": 28, "name": "Brent Cross", "position": [-0.213336,51.576599]}, {"id": 29, "name": "Brixton", "position": [-0.114552,51.462737]}, {"id": 30, "name": "Bromley-by-Bow", "position": [-0.011682,51.52484]}, {"id": 31, "name": "Buckhurst Hill", "position": [0.046713,51.626577]}, {"id": 32, "name": "Burnt Oak", "position": [-0.264331,51.602551]}, {"id": 33, "name": "Caledonian Road", "position": [-0.118361,51.547885]}, {"id": 34, "name": "Camden Town", "position": [-0.142452,51.539969]}, {"id": 35, "name": "Canada Water", "position": [-0.050807,51.498168]}, {"id": 36, "name": "Canary Wharf", "position": [-0.019467,51.503578]}, {"id": 37, "name": "Canning Town", "position": [0.008306,51.51387]}, {"id": 38, "name": "Cannon Street", "position": [-0.090251,51.511362]}, {"id": 39, "name": "Canons Park", "position": [-0.294392,51.60765]}, {"id": 40, "name": "Chalfont & Latimer", "position": [-0.561068,51.667907]}, {"id": 41, "name": "Chalk Farm", "position": [-0.153733,51.544149]}, {"id": 42, "name": "Chancery Lane", "position": [-0.111962,51.518494]}, {"id": 43, "name": "Charing Cross", "position": [-0.124803,51.508358]}, {"id": 44, "name": "Chesham", "position": [-0.61143,51.705379]}, {"id": 45, "name": "Chigwell", "position": [0.076179,51.617858]}, {"id": 46, "name": "Chiswick Park", "position": [-0.267737,51.49437]}, {"id": 47, "name": "Chorleywood", "position": [-0.518334,51.654265]}, {"id": 48, "name": "Clapham Common", "position": [-0.138315,51.461803]}, {"id": 49, "name": "Clapham North", "position": [-0.12991,51.464916]}, {"id": 50, "name": "Clapham South", "position": [-0.147984,51.452676]}, {"id": 51, "name": "Cockfosters", "position": [-0.149917,51.652024]}, {"id": 52, "name": "Colindale", "position": [-0.250288,51.59523]}, {"id": 53, "name": "Colliers Wood", "position": [-0.177415,51.418759]}, {"id": 54, "name": "Covent Garden", "position": [-0.124507,51.51276]}, {"id": 55, "name": "Croxley", "position": [-0.441604,51.647005]}, {"id": 56, "name": "Dagenham East", "position": [0.165833,51.544188]}, {"id": 57, "name": "Dagenham Heathway", "position": [0.14768,51.541212]}, {"id": 58, "name": "Debden", "position": [0.083801,51.645492]}, {"id": 59, "name": "Dollis Hill", "position": [-0.238798,51.55185]}, {"id": 60, "name": "Ealing Broadway", "position": [-0.30201,51.514861]}, {"id": 61, "name": "Ealing Common", "position": [-0.287151,51.510248]}, {"id": 62, "name": "Earl's Court", "position": [-0.194314,51.491356]}, {"id": 63, "name": "East Acton", "position": [-0.248112,51.516263]}, {"id": 64, "name": "Eastcote", "position": [-0.396823,51.576551]}, {"id": 65, "name": "East Finchley", "position": [-0.164744,51.587332]}, {"id": 66, "name": "East Ham", "position": [0.051516,51.539246]}, {"id": 67, "name": "East Putney", "position": [-0.210998,51.458879]}, {"id": 68, "name": "Ealing Common", "position": [-0.287151,51.510248]}, {"id": 69, "name": "Edgware", "position": [-0.275094,51.614229]}, {"id": 70, "name": "Edgware Road", "position": [-0.1678,51.5203]}, {"id": 71, "name": "Edgware Road (Bakerloo)", "position": [-0.17054,51.5225]}, {"id": 72, "name": "Elephant & Castle", "position": [-0.100739,51.495849]}, {"id": 73, "name": "Elm Park", "position": [0.197253,51.549125]}, {"id": 74, "name": "Embankment", "position": [-0.122367,51.507312]}, {"id": 75, "name": "Epping", "position": [0.113826,51.693686]}, {"id": 76, "name": "Euston", "position": [-0.133296,51.528664]}, {"id": 77, "name": "Euston Square", "position": [-0.135344,51.525468]}, {"id": 78, "name": "Fairlop", "position": [0.090593,51.59611]}, {"id": 79, "name": "Farringdon", "position": [-0.104843,51.520196]}, {"id": 80, "name": "Finchley Central", "position": [-0.193221,51.600903]}, {"id": 81, "name": "Finchley Road", "position": [-0.180051,51.547096]}, {"id": 82, "name": "Finsbury Park", "position": [-0.105881,51.564635]}, {"id": 83, "name": "Fulham Broadway", "position": [-0.195544,51.480261]}, {"id": 84, "name": "Gants Hill", "position": [0.066084,51.576553]}, {"id": 85, "name": "Gloucester Road", "position": [-0.183544,51.494499]}, {"id": 86, "name": "Golders Green", "position": [-0.194835,51.572215]}, {"id": 87, "name": "Goldhawk Road", "position": [-0.227404,51.502077]}, {"id": 88, "name": "Grange Hill", "position": [0.092273,51.613481]}, {"id": 89, "name": "Great Portland Street", "position": [-0.143961,51.523789]}, {"id": 90, "name": "Greenford", "position": [-0.345879,51.54198]}, {"id": 91, "name": "Green Park", "position": [-0.142478,51.50676]}, {"id": 92, "name": "Gunnersbury", "position": [-0.275164,51.491863]}, {"id": 93, "name": "Hainault", "position": [0.094109,51.602845]}, {"id": 94, "name": "Hammersmith", "position": [-0.222861,51.491819]}, {"id": 95, "name": "Hammersmith", "position": [-0.22464,51.493483]}, {"id": 96, "name": "Hampstead", "position": [-0.178015,51.556542]}, {"id": 97, "name": "Hanger Lane", "position": [-0.292996,51.530072]}, {"id": 98, "name": "Harlesden", "position": [-0.257496,51.536258]}, {"id": 99, "name": "Harrow & Wealdstone", "position": [-0.334253,51.592594]}, {"id": 100, "name": "Harrow-on-the-Hill", "position": [-0.337002,51.579388]}, {"id": 101, "name": "Hatton Cross", "position": [-0.423381,51.466685]}, {"id": 102, "name": "Heathrow Terminals 2 & 3", "position": [-0.452407,51.471289]}, {"id": 103, "name": "Heathrow Terminal 4", "position": [-0.44773,51.45978]}, {"id": 104, "name": "Heathrow Terminal 5", "position": [-0.490647,51.470025]}, {"id": 105, "name": "Hendon Central", "position": [-0.226734,51.583133]}, {"id": 106, "name": "High Barnet", "position": [-0.194165,51.651688]}, {"id": 107, "name": "Highbury & Islington", "position": [-0.104082,51.546495]}, {"id": 108, "name": "Highgate", "position": [-0.146935,51.577646]}, {"id": 109, "name": "High Street Kensington", "position": [-0.191566,51.500729]}, {"id": 110, "name": "Hillingdon", "position": [-0.449898,51.553777]}, {"id": 111, "name": "Holborn", "position": [-0.119841,51.517236]}, {"id": 112, "name": "Holland Park", "position": [-0.206558,51.507146]}, {"id": 113, "name": "Holloway Road", "position": [-0.112936,51.552816]}, {"id": 114, "name": "Hornchurch", "position": [0.218927,51.554355]}, {"id": 115, "name": "Hounslow Central", "position": [-0.365958,51.470925]}, {"id": 116, "name": "Hounslow East", "position": [-0.355275,51.473707]}, {"id": 117, "name": "Hounslow West", "position": [-0.385708,51.473105]}, {"id": 118, "name": "Hyde Park Corner", "position": [-0.152474,51.502584]}, {"id": 119, "name": "Ickenham", "position": [-0.44158,51.560824]}, {"id": 120, "name": "Kennington", "position": [-0.105071,51.488662]}, {"id": 121, "name": "Kensal Green", "position": [-0.224713,51.530524]}, {"id": 122, "name": "Kensington (Olympia)", "position": [-0.210379,51.497879]}, {"id": 123, "name": "Kentish Town", "position": [-0.140471,51.550009]}, {"id": 124, "name": "Kenton", "position": [-0.315217,51.581496]}, {"id": 125, "name": "Kew Gardens", "position": [-0.285381,51.476789]}, {"id": 126, "name": "Kilburn", "position": [-0.204633,51.546944]}, {"id": 127, "name": "Kilburn Park", "position": [-0.193966,51.535135]}, {"id": 128, "name": "Kingsbury", "position": [-0.278602,51.584876]}, {"id": 129, "name": "King's Cross St. Pancras", "position": [-0.123872,51.530312]}, {"id": 130, "name": "Knightsbridge", "position": [-0.160664,51.501355]}, {"id": 131, "name": "Ladbroke Grove", "position": [-0.210198,51.51721]}, {"id": 132, "name": "Lambeth North", "position": [-0.111768,51.49913]}, {"id": 133, "name": "Lancaster Gate", "position": [-0.17543,51.511891]}, {"id": 134, "name": "Latimer Road", "position": [-0.21746,51.513958]}, {"id": 135, "name": "Leicester Square", "position": [-0.128242,51.511291]}, {"id": 136, "name": "Leyton", "position": [-0.006465,51.558132]}, {"id": 137, "name": "Leytonstone", "position": [0.00914,51.568522]}, {"id": 138, "name": "Liverpool Street", "position": [-0.0814,51.5188]}, {"id": 139, "name": "London Bridge", "position": [-0.086006,51.504674]}, {"id": 140, "name": "Loughton", "position": [0.055279,51.641571]}, {"id": 141, "name": "Maida Vale", "position": [-0.185433,51.529995]}, {"id": 142, "name": "Manor House", "position": [-0.095685,51.570747]}, {"id": 143, "name": "Mansion House", "position": [-0.094198,51.512092]}, {"id": 144, "name": "Marble Arch", "position": [-0.158571,51.513965]}, {"id": 145, "name": "Marylebone", "position": [-0.163493,51.522396]}, {"id": 146, "name": "Mile End", "position": [-0.032666,51.525311]}, {"id": 147, "name": "Mill Hill East", "position": [-0.209896,51.608316]}, {"id": 148, "name": "Monument", "position": [-0.086188,51.51063]}, {"id": 149, "name": "Moor Park", "position": [-0.432913,51.62993]}, {"id": 150, "name": "Moorgate", "position": [-0.089018,51.518437]}, {"id": 151, "name": "Morden", "position": [-0.194852,51.402186]}, {"id": 152, "name": "Mornington Crescent", "position": [-0.138744,51.534362]}, {"id": 153, "name": "Neasden", "position": [-0.250115,51.554627]}, {"id": 154, "name": "Newbury Park", "position": [0.090303,51.575639]}, {"id": 155, "name": "North Acton", "position": [-0.25973,51.523432]}, {"id": 156, "name": "North Ealing", "position": [-0.288994,51.517622]}, {"id": 157, "name": "Northfields", "position": [-0.315065,51.500491]}, {"id": 158, "name": "North Greenwich", "position": [0.003586,51.500255]}, {"id": 159, "name": "North Harrow", "position": [-0.362633,51.584631]}, {"id": 160, "name": "Northolt", "position": [-0.368441,51.548212]}, {"id": 161, "name": "Northwick Park", "position": [-0.318199,51.578508]}, {"id": 162, "name": "Northwood", "position": [-0.423838,51.611213]}, {"id": 163, "name": "Northwood Hills", "position": [-0.409311,51.600802]}, {"id": 164, "name": "Notting Hill Gate", "position": [-0.195922,51.509375]}, {"id": 165, "name": "Oakwood", "position": [-0.131854,51.647638]}, {"id": 166, "name": "Old Street", "position": [-0.087623,51.525581]}, {"id": 167, "name": "Osterley", "position": [-0.352096,51.481216]}, {"id": 168, "name": "Oval", "position": [-0.113321,51.481412]}, {"id": 169, "name": "Oxford Circus", "position": [-0.140836,51.515223]}, {"id": 170, "name": "Paddington", "position": [-0.1774,51.5173]}, {"id": 171, "name": "Paddington", "position": [-0.1755,51.5188]}, {"id": 172, "name": "Park Royal", "position": [-0.284929,51.526834]}, {"id": 173, "name": "Parsons Green", "position": [-0.201124,51.47496]}, {"id": 174, "name": "Perivale", "position": [-0.32307,51.536341]}, {"id": 175, "name": "Piccadilly Circus", "position": [-0.133712,51.509697]}, {"id": 176, "name": "Pimlico", "position": [-0.133108,51.489553]}, {"id": 177, "name": "Pinner", "position": [-0.381224,51.592361]}, {"id": 178, "name": "Plaistow", "position": [0.017781,51.531288]}, {"id": 179, "name": "Preston Road", "position": [-0.294972,51.572103]}, {"id": 180, "name": "Putney Bridge", "position": [-0.209365,51.467865]}, {"id": 181, "name": "Queen's Park", "position": [-0.204798,51.534312]}, {"id": 182, "name": "Queensbury", "position": [-0.286332,51.593883]}, {"id": 183, "name": "Queensway", "position": [-0.18742,51.510449]}, {"id": 184, "name": "Ravenscourt Park", "position": [-0.235969,51.494068]}, {"id": 185, "name": "Rayners Lane", "position": [-0.371061,51.575396]}, {"id": 186, "name": "Redbridge", "position": [0.045394,51.576367]}, {"id": 187, "name": "Regent's Park", "position": [-0.145344,51.52381]}, {"id": 188, "name": "Richmond", "position": [-0.301739,51.463232]}, {"id": 189, "name": "South Ealing", "position": [-0.30704,51.501644]}, {"id": 190, "name": "Rickmansworth", "position": [-0.473685,51.640322]}, {"id": 191, "name": "Roding Valley", "position": [0.044026,51.616957]}, {"id": 192, "name": "Royal Oak", "position": [-0.188824,51.518294]}, {"id": 193, "name": "Ruislip", "position": [-0.421235,51.572161]}, {"id": 194, "name": "Ruislip Gardens", "position": [-0.409294,51.55996]}, {"id": 195, "name": "Ruislip Manor", "position": [-0.412849,51.573451]}, {"id": 196, "name": "Russell Square", "position": [-0.12459,51.523013]}, {"id": 197, "name": "Seven Sisters", "position": [-0.072467,51.583362]}, {"id": 198, "name": "Shepherd's Bush", "position": [-0.2195,51.5047]}, {"id": 199, "name": "Shepherd's Bush Market", "position": [-0.2248,51.5059]}, {"id": 200, "name": "Sloane Square", "position": [-0.156489,51.49236]}, {"id": 201, "name": "Snaresbrook", "position": [0.021464,51.580891]}, {"id": 202, "name": "Southfields", "position": [-0.206609,51.444883]}, {"id": 203, "name": "Southgate", "position": [-0.12777,51.632376]}, {"id": 204, "name": "South Harrow", "position": [-0.351894,51.56468]}, {"id": 205, "name": "South Kensington", "position": [-0.173923,51.494071]}, {"id": 206, "name": "South Ruislip", "position": [-0.399116,51.55689]}, {"id": 207, "name": "Southwark", "position": [-0.105795,51.503853]}, {"id": 208, "name": "South Wimbledon", "position": [-0.191975,51.41536]}, {"id": 209, "name": "Stamford Brook", "position": [-0.245246,51.49445]}, {"id": 210, "name": "Stanmore", "position": [-0.303099,51.619673]}, {"id": 211, "name": "Stepney Green", "position": [-0.047383,51.521996]}, {"id": 212, "name": "St. James's Park", "position": [-0.133879,51.49961]}, {"id": 213, "name": "St. John's Wood", "position": [-0.174065,51.534854]}, {"id": 214, "name": "St. Paul's", "position": [-0.097571,51.514835]}, {"id": 215, "name": "Stockwell", "position": [-0.122846,51.472159]}, {"id": 216, "name": "Stonebridge Park", "position": [-0.2754,51.543986]}, {"id": 217, "name": "Stratford", "position": [-0.003,51.5413]}, {"id": 218, "name": "Sudbury Hill", "position": [-0.336392,51.557339]}, {"id": 219, "name": "Sudbury Town", "position": [-0.316343,51.551397]}, {"id": 220, "name": "Swiss Cottage", "position": [-0.175627,51.543035]}, {"id": 221, "name": "Temple", "position": [-0.113726,51.51104]}, {"id": 222, "name": "Theydon Bois", "position": [0.102891,51.672552]}, {"id": 223, "name": "Tooting Bec", "position": [-0.1597,51.435838]}, {"id": 224, "name": "Tooting Broadway", "position": [-0.168685,51.427049]}, {"id": 225, "name": "Tottenham Court Road", "position": [-0.13111,51.516211]}, {"id": 226, "name": "Tottenham Hale", "position": [-0.060188,51.587998]}, {"id": 227, "name": "Totteridge & Whetstone", "position": [-0.179354,51.630246]}, {"id": 228, "name": "Tower Hill", "position": [-0.076701,51.510394]}, {"id": 229, "name": "Tufnell Park", "position": [-0.137742,51.556441]}, {"id": 230, "name": "Turnham Green", "position": [-0.254525,51.495182]}, {"id": 231, "name": "Turnpike Lane", "position": [-0.102805,51.590358]}, {"id": 232, "name": "Upminster", "position": [0.251401,51.558764]}, {"id": 233, "name": "Upminster Bridge", "position": [0.234542,51.557719]}, {"id": 234, "name": "Upney", "position": [0.101532,51.538406]}, {"id": 235, "name": "Upton Park", "position": [0.034542,51.536628]}, {"id": 236, "name": "Uxbridge", "position": [-0.477102,51.546454]}, {"id": 237, "name": "Vauxhall", "position": [-0.12383,51.485736]}, {"id": 238, "name": "Victoria", "position": [-0.143921,51.496424]}, {"id": 239, "name": "Walthamstow Central", "position": [-0.019941,51.583018]}, {"id": 240, "name": "Wanstead", "position": [0.02876,51.574902]}, {"id": 241, "name": "Warren Street", "position": [-0.138278,51.52458]}, {"id": 242, "name": "Warwick Avenue", "position": [-0.182953,51.523104]}, {"id": 243, "name": "Waterloo", "position": [-0.113259,51.503146]}, {"id": 244, "name": "Watford", "position": [-0.41727,51.657604]}, {"id": 245, "name": "Wembley Central", "position": [-0.296392,51.551864]}, {"id": 246, "name": "Wembley Park", "position": [-0.279243,51.563322]}, {"id": 247, "name": "West Acton", "position": [-0.280657,51.51777]}, {"id": 248, "name": "West Brompton", "position": [-0.195539,51.487329]}, {"id": 249, "name": "West Finchley", "position": [-0.188917,51.609262]}, {"id": 250, "name": "West Ham", "position": [0.005317,51.528526]}, {"id": 251, "name": "West Hampstead", "position": [-0.191127,51.547474]}, {"id": 252, "name": "West Harrow", "position": [-0.353847,51.578924]}, {"id": 253, "name": "West Kensington", "position": [-0.206204,51.490109]}, {"id": 254, "name": "Westminster", "position": [-0.125002,51.501401]}, {"id": 255, "name": "West Ruislip", "position": [-0.43786,51.569587]}, {"id": 256, "name": "Whitechapel", "position": [-0.05942,51.519588]}, {"id": 257, "name": "White City", "position": [-0.224632,51.512232]}, {"id": 258, "name": "Willesden Green", "position": [-0.222408,51.549373]}, {"id": 259, "name": "Willesden Junction", "position": [-0.243909,51.532234]}, {"id": 260, "name": "Wimbledon", "position": [-0.206663,51.421108]}, {"id": 261, "name": "Wimbledon Park", "position": [-0.199186,51.434581]}, {"id": 262, "name": "Woodford", "position": [0.034056,51.607202]}, {"id": 263, "name": "Wood Green", "position": [-0.109527,51.597454]}, {"id": 264, "name": "Woodside Park", "position": [-0.185426,51.617868]}, {"id": 265, "name": "Abbey Road", "position": [0.003723,51.531952]}, {"id": 266, "name": "All Saints", "position": [-0.012625,51.510477]}, {"id": 267, "name": "Beckton", "position": [0.061525,51.514377]}, {"id": 268, "name": "Beckton Park", "position": [0.054822,51.508901]}, {"id": 269, "name": "Blackwall", "position": [-0.007235,51.507832]}, {"id": 270, "name": "Bow Church", "position": [-0.0205,51.527615]}, {"id": 271, "name": "Canning Town", "position": [0.008306,51.51387]}, {"id": 272, "name": "Crossharbour", "position": [-0.014933,51.49584]}, {"id": 273, "name": "Custom House", "position": [0.025773,51.509622]}, {"id": 274, "name": "Cutty Sark", "position": [-0.010582,51.481944]}, {"id": 275, "name": "Cyprus", "position": [0.063841,51.508527]}, {"id": 276, "name": "Deptford Bridge", "position": [-0.022052,51.474477]}, {"id": 277, "name": "Devons Road", "position": [-0.018008,51.522258]}, {"id": 278, "name": "East India", "position": [-0.00237,51.508684]}, {"id": 279, "name": "Elverson Road", "position": [-0.016816,51.468372]}, {"id": 280, "name": "Gallions Reach", "position": [0.071775,51.509034]}, {"id": 281, "name": "Greenwich", "position": [-0.014863,51.477548]}, {"id": 282, "name": "Heron Quays", "position": [-0.021954,51.503387]}, {"id": 283, "name": "Island Gardens", "position": [-0.010493,51.48795]}, {"id": 284, "name": "King George V", "position": [0.062206,51.502009]}, {"id": 285, "name": "Langdon Park", "position": [-0.015214,51.518884]}, {"id": 286, "name": "Lewisham", "position": [-0.012433,51.464881]}, {"id": 287, "name": "London City Airport", "position": [0.047873,51.50369]}, {"id": 288, "name": "Mudchute", "position": [-0.01496,51.491236]}, {"id": 289, "name": "Pontoon Dock", "position": [0.033326,51.502216]}, {"id": 290, "name": "Poplar", "position": [-0.017275,51.507588]}, {"id": 291, "name": "Prince Regent", "position": [0.033489,51.509435]}, {"id": 292, "name": "Pudding Mill Lane", "position": [-0.012769,51.534328]}, {"id": 293, "name": "Royal Albert", "position": [0.045177,51.508494]}, {"id": 294, "name": "Royal Victoria", "position": [0.017965,51.509055]}, {"id": 295, "name": "Shadwell", "position": [-0.056919,51.5113]}, {"id": 296, "name": "South Quay", "position": [-0.018461,51.500864]}, {"id": 297, "name": "Star Lane", "position": [0.004191,51.520604]}, {"id": 298, "name": "Stratford", "position": [-0.0008,51.5428]}, {"id": 299, "name": "Stratford High Street", "position": [-0.00108,51.538149]}, {"id": 300, "name": "Stratford International", "position": [-0.008778,51.544809]}, {"id": 301, "name": "Tower Gateway", "position": [-0.07441,51.510393]}, {"id": 302, "name": "Westferry", "position": [-0.026323,51.509632]}, {"id": 303, "name": "West Ham", "position": [0.005317,51.528526]}, {"id": 304, "name": "West India Quay", "position": [-0.020582,51.506763]}, {"id": 305, "name": "West Silvertown", "position": [0.022246,51.502884]}, {"id": 306, "name": "Woolwich Arsenal", "position": [0.069194,51.489907]}, {"id": 307, "name": "Acton Central", "position": [-0.26343,51.508757]}, {"id": 308, "name": "Anerley", "position": [-0.065137,51.412517]}, {"id": 309, "name": "Brondesbury", "position": [-0.202838,51.545262]}, {"id": 310, "name": "Brondesbury Park", "position": [-0.210474,51.540325]}, {"id": 311, "name": "Bruce Grove", "position": [-0.070399,51.594011]}, {"id": 312, "name": "Bush Hill Park", "position": [-0.06928,51.641482]}, {"id": 313, "name": "Caledonian Road & Barnsbury", "position": [-0.115205,51.543284]}, {"id": 314, "name": "Camden Road", "position": [-0.139203,51.541851]}, {"id": 315, "name": "Canonbury", "position": [-0.092574,51.548188]}, {"id": 316, "name": "Carpenders Park", "position": [-0.385829,51.628186]}, {"id": 317, "name": "Cheshunt", "position": [-0.023887,51.702873]}, {"id": 318, "name": "Chingford", "position": [0.009514,51.633253]}, {"id": 319, "name": "Clapham High Street", "position": [-0.132465,51.465469]}, {"id": 320, "name": "Clapton", "position": [-0.057489,51.561569]}, {"id": 321, "name": "Crouch Hill", "position": [-0.117133,51.571327]}, {"id": 322, "name": "Crystal Palace", "position": [-0.072607,51.41817]}, {"id": 323, "name": "Dalston Junction", "position": [-0.074994,51.546094]}, {"id": 324, "name": "Dalston Kingsland", "position": [-0.076227,51.548668]}, {"id": 325, "name": "Denmark Hill", "position": [-0.090988,51.4682]}, {"id": 326, "name": "Edmonton Green", "position": [-0.061639,51.625116]}, {"id": 327, "name": "Emerson Park", "position": [0.220223,51.569115]}, {"id": 328, "name": "Enfield Town", "position": [-0.07933,51.65197]}, {"id": 329, "name": "Euston", "position": [-0.133296,51.528664]}, {"id": 330, "name": "Finchley Road & Frognal", "position": [-0.183651,51.550119]}, {"id": 331, "name": "Forest Hill", "position": [-0.053329,51.439308]}, {"id": 332, "name": "Gospel Oak", "position": [-0.151301,51.555405]}, {"id": 333, "name": "Gunnersbury", "position": [-0.275164,51.491863]}, {"id": 334, "name": "Hackney Central", "position": [-0.05559,51.547257]}, {"id": 335, "name": "Hackney Downs", "position": [-0.060185,51.549078]}, {"id": 336, "name": "Haggerston", "position": [-0.075595,51.538685]}, {"id": 337, "name": "Hampstead Heath", "position": [-0.164566,51.5552]}, {"id": 338, "name": "Harlesden", "position": [-0.257496,51.536258]}, {"id": 339, "name": "Harringay Green Lanes", "position": [-0.098217,51.577146]}, {"id": 340, "name": "Harrow & Wealdstone", "position": [-0.334253,51.592594]}, {"id": 341, "name": "Hatch End", "position": [-0.369179,51.609828]}, {"id": 342, "name": "Headstone Lane", "position": [-0.356908,51.602499]}, {"id": 343, "name": "Highams Park", "position": [-0.000135,51.608356]}, {"id": 344, "name": "Highbury & Islington", "position": [-0.104082,51.546495]}, {"id": 345, "name": "Homerton", "position": [-0.038512,51.546595]}, {"id": 346, "name": "Honor Oak Park", "position": [-0.044153,51.450648]}, {"id": 347, "name": "Hoxton", "position": [-0.075586,51.531391]}, {"id": 348, "name": "Imperial Wharf", "position": [-0.182838,51.474939]}, {"id": 349, "name": "Kensal Green", "position": [-0.224713,51.530524]}, {"id": 350, "name": "Kensal Rise", "position": [-0.220821,51.534215]}, {"id": 351, "name": "Kenton", "position": [-0.315217,51.581496]}, {"id": 352, "name": "Kew Gardens", "position": [-0.285381,51.476789]}, {"id": 353, "name": "Kilburn High Road", "position": [-0.191113,51.537267]}, {"id": 354, "name": "Leyton Midland Road", "position": [-0.008066,51.569364]}, {"id": 355, "name": "Leytonstone High Road", "position": [0.008254,51.563807]}, {"id": 356, "name": "Liverpool Street", "position": [-0.08225,51.517598]}, {"id": 357, "name": "London Fields", "position": [-0.0577,51.540719]}, {"id": 358, "name": "New Cross", "position": [-0.032279,51.476429]}, {"id": 359, "name": "New Cross Gate", "position": [-0.039529,51.475265]}, {"id": 360, "name": "North Wembley", "position": [-0.303948,51.562396]}, {"id": 361, "name": "Norwood Junction", "position": [-0.07521,51.396954]}, {"id": 362, "name": "Penge West", "position": [-0.060646,51.418063]}, {"id": 363, "name": "Rectory Road", "position": [-0.068386,51.558763]}, {"id": 364, "name": "Richmond", "position": [-0.301739,51.463232]}, {"id": 365, "name": "Romford", "position": [0.183055,51.574642]}, {"id": 366, "name": "Rotherhithe", "position": [-0.052966,51.501594]}, {"id": 367, "name": "St. James Street", "position": [-0.032805,51.580609]}, {"id": 368, "name": "Seven Sisters", "position": [-0.072467,51.583362]}, {"id": 369, "name": "Shadwell", "position": [-0.056919,51.5113]}, {"id": 370, "name": "Shepherd's Bush", "position": [-0.22104,51.50426]}, {"id": 371, "name": "Shoreditch High Street", "position": [-0.077087,51.523467]}, {"id": 372, "name": "Silver Street", "position": [-0.07259,51.615242]}, {"id": 373, "name": "South Acton", "position": [-0.270215,51.499685]}, {"id": 374, "name": "Southbury", "position": [-0.052983,51.648434]}, {"id": 375, "name": "South Hampstead", "position": [-0.178371,51.541477]}, {"id": 376, "name": "South Kenton", "position": [-0.308143,51.571044]}, {"id": 377, "name": "South Tottenham", "position": [-0.071856,51.580402]}, {"id": 378, "name": "Stamford Hill", "position": [-0.076668,51.574447]}, {"id": 379, "name": "Stoke Newington", "position": [-0.072335,51.564637]}, {"id": 380, "name": "Stonebridge Park", "position": [-0.2754,51.543986]}, {"id": 381, "name": "Stratford", "position": [-0.0022,51.5419]}, {"id": 382, "name": "Surrey Quays", "position": [-0.04753,51.493267]}, {"id": 383, "name": "Sydenham", "position": [-0.055089,51.427341]}, {"id": 384, "name": "Theobalds Grove", "position": [-0.034748,51.692373]}, {"id": 385, "name": "Turkey Street", "position": [-0.04723,51.672654]}, {"id": 386, "name": "Upper Holloway", "position": [-0.129109,51.563623]}, {"id": 387, "name": "Upminster", "position": [0.251401,51.558764]}, {"id": 388, "name": "Walthamstow Central", "position": [-0.019941,51.583018]}, {"id": 389, "name": "Walthamstow Queen's Road", "position": [-0.023844,51.581546]}, {"id": 390, "name": "Wandsworth Road", "position": [-0.139038,51.470223]}, {"id": 391, "name": "Wapping", "position": [-0.055861,51.504341]}, {"id": 392, "name": "Watford High Street", "position": [-0.391697,51.652653]}, {"id": 393, "name": "Watford Junction", "position": [-0.396172,51.663882]}, {"id": 394, "name": "Wembley Central", "position": [-0.296392,51.551864]}, {"id": 395, "name": "West Croydon", "position": [-0.102034,51.378552]}, {"id": 396, "name": "West Hampstead", "position": [-0.191127,51.547474]}, {"id": 397, "name": "White Hart Lane", "position": [-0.07087,51.605035]}, {"id": 398, "name": "Willesden Junction", "position": [-0.243909,51.532234]}, {"id": 399, "name": "Woodgrange Park", "position": [0.044572,51.549053]}, {"id": 400, "name": "Wood Street", "position": [-0.001954,51.58667]}, {"id": 401, "name": "Heathrow Central", "position": [-0.454,51.471]}, {"id": 402, "name": "Hayes & Harlington", "position": [-0.421,51.501]}, {"id": 403, "name": "Southall", "position": [-0.378,51.506]}, {"id": 404, "name": "Hanwell", "position": [-0.337,51.51]}, {"id": 405, "name": "West Ealing", "position": [-0.312,51.513]}, {"id": 407, "name": "Acton Main Line", "position": [-0.267,51.517]}, {"id": 409, "name": "Shenfield", "position": [0.329,51.626]}, {"id": 410, "name": "Brentwood", "position": [0.305,51.617]}, {"id": 411, "name": "Harold Wood", "position": [0.258,51.59]}, {"id": 412, "name": "Gidea Park", "position": [0.211,51.58]}, {"id": 413, "name": "Romford", "position": [0.18,51.574]}, {"id": 414, "name": "Chadwell Heath", "position": [0.129,51.564]}, {"id": 415, "name": "Goodmayes", "position": [0.108,51.56]}, {"id": 416, "name": "Seven Kings", "position": [0.09,51.558]}, {"id": 417, "name": "Ilford", "position": [0.07,51.559]}, {"id": 418, "name": "Manor Park", "position": [0.044,51.553]}, {"id": 419, "name": "Forest Gate", "position": [0.026,51.551]}, {"id": 420, "name": "Maryland", "position": [0.005,51.546]}, {"id": 422, "name": "Liverpool Street", "position": [-0.081,51.519]}, {"id": 423, "name": "Abbey Wood", "position": [0.120272, 51.490784]}, {"id": 424, "name": "Woolwich", "position": [0.071819, 51.491578]}, {"id": 425, "name": "Canary Wharf (Elizabeth Line)", "position": [-0.0177,51.5055]}, {"id": 426, "name": "Barking Riverside", "position": [0.113, 51.529]}, {"id": 427, "name": "Hackney Wick", "position": [-0.0245, 51.5433]}, {"id": 428, "name": "Clapham Junction", "position": [-0.170, 51.463]}, {"id": 429, "name": "Queens Road Peckham", "position": [-0.057, 51.473]}, {"id": 430, "name": "Peckham Rye", "position": [-0.070, 51.469]}, {"id": 431, "name": "Brockley", "position": [-0.038, 51.464]}, {"id": 432, "name": "Cambridge Heath", "position": [-0.059, 51.529]}, {"id": 433, "name": "Bethnal Green", "position": [-0.063, 51.525]}, {"id": 434, "name": "Bushey", "position": [-0.401, 51.642]}, {"id": 435, "name": "Wanstead Park", "position": [0.036, 51.551]}, {"id": 436, "name": "Kensal Rise", "position": [-0.2208, 51.5342]}, 
    
    // NEW: Elizabeth Line extension to Reading
    {"id": 500, "name": "West Drayton", "position": [-0.472, 51.511]},
    {"id": 501, "name": "Iver", "position": [-0.510, 51.513]},
    {"id": 502, "name": "Langley", "position": [-0.542, 51.509]},
    {"id": 503, "name": "Slough", "position": [-0.592, 51.512]},
    {"id": 504, "name": "Burnham", "position": [-0.655, 51.521]},
    {"id": 505, "name": "Taplow", "position": [-0.686, 51.524]},
    {"id": 506, "name": "Maidenhead", "position": [-0.718, 51.517]},
    {"id": 507, "name": "Twyford", "position": [-0.865, 51.476]},
    {"id": 508, "name": "Reading", "position": [-0.971, 51.458]}] ,
    "links": [{"source": 0, "target": 189, "line": "piccadilly"}, {"source": 0, "target": 68, "line": "piccadilly"}, {"source": 0, "target": 230, "line": "piccadilly"}, {"source": 1, "target": 138, "line": "metropolitan"}, {"source": 1, "target": 228, "line": "circle"}, {"source": 1, "target": 138, "line": "circle"}, {"source": 3, "target": 172, "line": "piccadilly"}, {"source": 3, "target": 219, "line": "piccadilly"}, {"source": 4, "target": 40, "line": "metropolitan"}, {"source": 5, "target": 129, "line": "northern"}, {"source": 5, "target": 166, "line": "northern"}, {"source": 6, "target": 108, "line": "northern"}, {"source": 6, "target": 229, "line": "northern"}, {"source": 7, "target": 26, "line": "piccadilly"}, {"source": 7, "target": 203, "line": "piccadilly"}, {"source": 8, "target": 113, "line": "piccadilly"}, {"source": 8, "target": 82, "line": "piccadilly"}, {"source": 9, "target": 81, "line": "metropolitan"}, {"source": 9, "target": 89, "line": "metropolitan"}, {"source": 9, "target": 70, "line": "circle"}, {"source": 9, "target": 89, "line": "circle"}, {"source": 9, "target": 187, "line": "bakerloo"}, {"source": 9, "target": 145, "line": "bakerloo"}, {"source": 9, "target": 213, "line": "jubilee"}, {"source": 9, "target": 23, "line": "jubilee"}, {"source": 10, "target": 50, "line": "northern"}, {"source": 10, "target": 48, "line": "northern"}, {"source": 11, "target": 139, "line": "northern"}, {"source": 11, "target": 150, "line": "northern"}, {"source": 11, "target": 214, "line": "central"}, {"source": 11, "target": 138, "line": "central"}, {"source": 11, "target": 243, "line": "waterloo-and-city"}, {"source": 11, "target": 295, "line": "dlr"}, {"source": 11, "target": 148, "line": "interchange"}, {"source": 12, "target": 150, "line": "metropolitan"}, {"source": 12, "target": 79, "line": "metropolitan"}, {"source": 12, "target": 150, "line": "circle"}, {"source": 12, "target": 79, "line": "circle"}, {"source": 14, "target": 154, "line": "central"}, {"source": 14, "target": 93, "line": "central"}, {"source": 15, "target": 94, "line": "piccadilly"}, {"source": 15, "target": 62, "line": "piccadilly"}, {"source": 16, "target": 171, "line": "circle"}, {"source": 16, "target": 164, "line": "circle"}, {"source": 18, "target": 41, "line": "northern"}, {"source": 18, "target": 96, "line": "northern"}, {"source": 19, "target": 139, "line": "jubilee"}, {"source": 19, "target": 35, "line": "jubilee"}, {"source": 20, "target": 146, "line": "central"}, {"source": 20, "target": 138, "line": "central"}, {"source": 21, "target": 221, "line": "circle"}, {"source": 21, "target": 143, "line": "circle"}, {"source": 22, "target": 239, "line": "victoria"}, {"source": 22, "target": 226, "line": "victoria"}, {"source": 23, "target": 169, "line": "central"}, {"source": 23, "target": 144, "line": "central"}, {"source": 23, "target": 9, "line": "jubilee"}, {"source": 23, "target": 91, "line": "jubilee"}, {"source": 24, "target": 139, "line": "northern"}, {"source": 24, "target": 72, "line": "northern"}, {"source": 25, "target": 157, "line": "piccadilly"}, {"source": 25, "target": 167, "line": "piccadilly"}, {"source": 26, "target": 263, "line": "piccadilly"}, {"source": 26, "target": 7, "line": "piccadilly"}, {"source": 28, "target": 105, "line": "northern"}, {"source": 28, "target": 86, "line": "northern"}, {"source": 29, "target": 215, "line": "victoria"}, {"source": 31, "target": 140, "line": "central"}, {"source": 31, "target": 262, "line": "central"}, {"source": 32, "target": 52, "line": "northern"}, {"source": 32, "target": 69, "line": "northern"}, {"source": 33, "target": 129, "line": "piccadilly"}, {"source": 33, "target": 113, "line": "piccadilly"}, {"source": 34, "target": 152, "line": "northern"}, {"source": 34, "target": 76, "line": "northern"}, {"source": 34, "target": 41, "line": "northern"}, {"source": 35, "target": 19, "line": "jubilee"}, {"source": 35, "target": 36, "line": "jubilee"}, {"source": 36, "target": 35, "line": "jubilee"}, {"source": 36, "target": 158, "line": "jubilee"}, {"source": 37, "target": 158, "line": "jubilee"}, {"source": 37, "target": 250, "line": "jubilee"}, {"source": 38, "target": 148, "line": "circle"}, {"source": 38, "target": 143, "line": "circle"}, {"source": 39, "target": 210, "line": "jubilee"}, {"source": 39, "target": 182, "line": "jubilee"}, {"source": 40, "target": 4, "line": "metropolitan"}, {"source": 40, "target": 47, "line": "metropolitan"}, {"source": 41, "target": 34, "line": "northern"}, {"source": 41, "target": 18, "line": "northern"}, {"source": 42, "target": 111, "line": "central"}, {"source": 42, "target": 214, "line": "central"}, {"source": 43, "target": 74, "line": "bakerloo"}, {"source": 43, "target": 175, "line": "bakerloo"}, {"source": 43, "target": 74, "line": "northern"}, {"source": 43, "target": 135, "line": "northern"}, {"source": 44, "target": 40, "line": "metropolitan"}, {"source": 45, "target": 88, "line": "central"}, {"source": 45, "target": 191, "line": "central"}, {"source": 47, "target": 40, "line": "metropolitan"}, {"source": 47, "target": 190, "line": "metropolitan"}, {"source": 48, "target": 10, "line": "northern"}, {"source": 48, "target": 49, "line": "northern"}, {"source": 49, "target": 48, "line": "northern"}, {"source": 49, "target": 215, "line": "northern"}, {"source": 50, "target": 223, "line": "northern"}, {"source": 50, "target": 10, "line": "northern"}, {"source": 51, "target": 165, "line": "piccadilly"}, {"source": 52, "target": 105, "line": "northern"}, {"source": 52, "target": 32, "line": "northern"}, {"source": 53, "target": 208, "line": "northern"}, {"source": 53, "target": 224, "line": "northern"}, {"source": 54, "target": 135, "line": "piccadilly"}, {"source": 54, "target": 111, "line": "piccadilly"}, {"source": 55, "target": 244, "line": "metropolitan"}, {"source": 55, "target": 149, "line": "metropolitan"}, {"source": 58, "target": 222, "line": "central"}, {"source": 58, "target": 140, "line": "central"}, {"source": 59, "target": 153, "line": "jubilee"}, {"source": 59, "target": 258, "line": "jubilee"}, {"source": 62, "target": 15, "line": "piccadilly"}, {"source": 62, "target": 85, "line": "piccadilly"}, {"source": 63, "target": 155, "line": "central"}, {"source": 63, "target": 257, "line": "central"}, {"source": 64, "target": 185, "line": "metropolitan"}, {"source": 64, "target": 195, "line": "metropolitan"}, {"source": 64, "target": 185, "line": "piccadilly"}, {"source": 64, "target": 195, "line": "piccadilly"}, {"source": 65, "target": 80, "line": "northern"}, {"source": 65, "target": 108, "line": "northern"}, {"source": 68, "target": 0, "line": "piccadilly"}, {"source": 68, "target": 156, "line": "piccadilly"}, {"source": 69, "target": 32, "line": "northern"}, {"source": 70, "target": 171, "line": "bakerloo"}, {"source": 70, "target": 170, "line": "circle"}, {"source": 70, "target": 9, "line": "circle"}, {"source": 71, "target": 145, "line": "bakerloo"}, {"source": 71, "target": 170, "line": "bakerloo"}, {"source": 72, "target": 24, "line": "northern"}, {"source": 72, "target": 132, "line": "bakerloo"}, {"source": 72, "target": 120, "line": "northern"}, {"source": 74, "target": 43, "line": "bakerloo"}, {"source": 74, "target": 243, "line": "bakerloo"}, {"source": 74, "target": 43, "line": "northern"}, {"source": 74, "target": 243, "line": "northern"}, {"source": 74, "target": 221, "line": "circle"}, {"source": 74, "target": 254, "line": "circle"}, {"source": 75, "target": 222, "line": "central"}, {"source": 76, "target": 34, "line": "northern"}, {"source": 76, "target": 129, "line": "northern"}, {"source": 76, "target": 241, "line": "northern"}, {"source": 76, "target": 241, "line": "victoria"}, {"source": 76, "target": 129, "line": "victoria"}, {"source": 77, "target": 89, "line": "metropolitan"}, {"source": 77, "target": 129, "line": "metropolitan"}, {"source": 77, "target": 89, "line": "circle"}, {"source": 77, "target": 129, "line": "circle"}, {"source": 78, "target": 14, "line": "central"}, {"source": 78, "target": 93, "line": "central"}, {"source": 79, "target": 12, "line": "metropolitan"}, {"source": 79, "target": 129, "line": "metropolitan"}, {"source": 79, "target": 12, "line": "circle"}, {"source": 79, "target": 129, "line": "circle"}, {"source": 80, "target": 249, "line": "northern"}, {"source": 80, "target": 65, "line": "northern"}, {"source": 80, "target": 147, "line": "northern"}, {"source": 81, "target": 251, "line": "jubilee"}, {"source": 81, "target": 220, "line": "jubilee"}, {"source": 81, "target": 246, "line": "metropolitan"}, {"source": 81, "target": 9, "line": "metropolitan"}, {"source": 82, "target": 8, "line": "piccadilly"}, {"source": 82, "target": 142, "line": "piccadilly"}, {"source": 82, "target": 107, "line": "victoria"}, {"source": 82, "target": 197, "line": "victoria"}, {"source": 84, "target": 186, "line": "central"}, {"source": 84, "target": 154, "line": "central"}, {"source": 85, "target": 62, "line": "piccadilly"}, {"source": 85, "target": 205, "line": "piccadilly"}, {"source": 85, "target": 109, "line": "circle"}, {"source": 85, "target": 205, "line": "circle"}, {"source": 86, "target": 28, "line": "northern"}, {"source": 86, "target": 96, "line": "northern"}, {"source": 88, "target": 45, "line": "central"}, {"source": 88, "target": 93, "line": "central"}, {"source": 89, "target": 9, "line": "metropolitan"}, {"source": 89, "target": 77, "line": "metropolitan"}, {"source": 89, "target": 9, "line": "circle"}, {"source": 89, "target": 77, "line": "circle"}, {"source": 90, "target": 174, "line": "central"}, {"source": 90, "target": 97, "line": "central"}, {"source": 91, "target": 23, "line": "jubilee"}, {"source": 91, "target": 254, "line": "jubilee"}, {"source": 91, "target": 118, "line": "piccadilly"}, {"source": 91, "target": 175, "line": "piccadilly"}, {"source": 91, "target": 238, "line": "victoria"}, {"source": 91, "target": 169, "line": "victoria"}, {"source": 93, "target": 88, "line": "central"}, {"source": 93, "target": 78, "line": "central"}, {"source": 93, "target": 14, "line": "central"}, {"source": 94, "target": 15, "line": "piccadilly"}, {"source": 94, "target": 230, "line": "piccadilly"}, {"source": 96, "target": 86, "line": "northern"}, {"source": 96, "target": 18, "line": "northern"}, {"source": 97, "target": 90, "line": "central"}, {"source": 97, "target": 155, "line": "central"}, {"source": 98, "target": 216, "line": "bakerloo"}, {"source": 98, "target": 259, "line": "bakerloo"}, {"source": 99, "target": 124, "line": "bakerloo"}, {"source": 100, "target": 159, "line": "metropolitan"}, {"source": 100, "target": 252, "line": "metropolitan"}, {"source": 101, "target": 117, "line": "piccadilly"}, {"source": 101, "target": 102, "line": "piccadilly"}, {"source": 101, "target": 103, "line": "piccadilly"}, {"source": 102, "target": 101, "line": "piccadilly"}, {"source": 102, "target": 104, "line": "piccadilly"}, {"source": 103, "target": 101, "line": "piccadilly"}, {"source": 104, "target": 102, "line": "piccadilly"}, {"source": 105, "target": 28, "line": "northern"}, {"source": 105, "target": 52, "line": "northern"}, {"source": 106, "target": 227, "line": "northern"}, {"source": 107, "target": 82, "line": "victoria"}, {"source": 107, "target": 129, "line": "victoria"}, {"source": 108, "target": 6, "line": "northern"}, {"source": 108, "target": 65, "line": "northern"}, {"source": 109, "target": 164, "line": "circle"}, {"source": 109, "target": 85, "line": "circle"}, {"source": 110, "target": 236, "line": "metropolitan"}, {"source": 110, "target": 119, "line": "metropolitan"}, {"source": 110, "target": 236, "line": "piccadilly"}, {"source": 110, "target": 119, "line": "piccadilly"}, {"source": 111, "target": 54, "line": "piccadilly"}, {"source": 111, "target": 196, "line": "piccadilly"}, {"source": 111, "target": 42, "line": "central"}, {"source": 111, "target": 225, "line": "central"}, {"source": 112, "target": 198, "line": "central"}, {"source": 112, "target": 164, "line": "central"}, {"source": 113, "target": 8, "line": "piccadilly"}, {"source": 113, "target": 33, "line": "piccadilly"}, {"source": 115, "target": 116, "line": "piccadilly"}, {"source": 115, "target": 117, "line": "piccadilly"}, {"source": 116, "target": 167, "line": "piccadilly"}, {"source": 116, "target": 115, "line": "piccadilly"}, {"source": 117, "target": 115, "line": "piccadilly"}, {"source": 117, "target": 101, "line": "piccadilly"}, {"source": 118, "target": 130, "line": "piccadilly"}, {"source": 118, "target": 91, "line": "piccadilly"}, {"source": 119, "target": 110, "line": "metropolitan"}, {"source": 119, "target": 193, "line": "metropolitan"}, {"source": 119, "target": 110, "line": "piccadilly"}, {"source": 119, "target": 193, "line": "piccadilly"}, {"source": 120, "target": 72, "line": "northern"}, {"source": 120, "target": 168, "line": "northern"}, {"source": 120, "target": 243, "line": "northern"}, {"source": 121, "target": 181, "line": "bakerloo"}, {"source": 121, "target": 259, "line": "bakerloo"}, {"source": 123, "target": 34, "line": "northern"}, {"source": 123, "target": 229, "line": "northern"}, {"source": 124, "target": 99, "line": "bakerloo"}, {"source": 124, "target": 360, "line": "bakerloo"}, {"source": 126, "target": 258, "line": "jubilee"}, {"source": 126, "target": 251, "line": "jubilee"}, {"source": 127, "target": 141, "line": "bakerloo"}, {"source": 127, "target": 181, "line": "bakerloo"}, {"source": 128, "target": 246, "line": "jubilee"}, {"source": 128, "target": 182, "line": "jubilee"}, {"source": 129, "target": 76, "line": "northern"}, {"source": 129, "target": 5, "line": "northern"}, {"source": 129, "target": 196, "line": "piccadilly"}, {"source": 129, "target": 33, "line": "piccadilly"}, {"source": 129, "target": 76, "line": "victoria"}, {"source": 129, "target": 107, "line": "victoria"}, {"source": 129, "target": 77, "line": "metropolitan"}, {"source": 129, "target": 79, "line": "metropolitan"}, {"source": 129, "target": 77, "line": "circle"}, {"source": 129, "target": 79, "line": "circle"}, {"source": 130, "target": 205, "line": "piccadilly"}, {"source": 130, "target": 118, "line": "piccadilly"}, {"source": 132, "target": 243, "line": "bakerloo"}, {"source": 132, "target": 72, "line": "bakerloo"}, {"source": 133, "target": 183, "line": "central"}, {"source": 133, "target": 144, "line": "central"}, {"source": 135, "target": 43, "line": "northern"}, {"source": 135, "target": 225, "line": "northern"}, {"source": 135, "target": 175, "line": "piccadilly"}, {"source": 135, "target": 54, "line": "piccadilly"}, {"source": 136, "target": 217, "line": "central"}, {"source": 136, "target": 137, "line": "central"}, {"source": 137, "target": 136, "line": "central"}, {"source": 137, "target": 201, "line": "central"}, {"source": 138, "target": 1, "line": "metropolitan"}, {"source": 138, "target": 150, "line": "metropolitan"}, {"source": 138, "target": 1, "line": "circle"}, {"source": 138, "target": 150, "line": "circle"}, {"source": 138, "target": 20, "line": "central"}, {"source": 138, "target": 11, "line": "central"}, {"source": 139, "target": 11, "line": "northern"}, {"source": 139, "target": 24, "line": "northern"}, {"source": 139, "target": 207, "line": "jubilee"}, {"source": 139, "target": 19, "line": "jubilee"}, {"source": 140, "target": 31, "line": "central"}, {"source": 140, "target": 58, "line": "central"}, {"source": 141, "target": 242, "line": "bakerloo"}, {"source": 141, "target": 127, "line": "bakerloo"}, {"source": 142, "target": 82, "line": "piccadilly"}, {"source": 142, "target": 231, "line": "piccadilly"}, {"source": 143, "target": 21, "line": "circle"}, {"source": 143, "target": 38, "line": "circle"}, {"source": 144, "target": 23, "line": "central"}, {"source": 144, "target": 133, "line": "central"}, {"source": 145, "target": 9, "line": "bakerloo"}, {"source": 145, "target": 71, "line": "bakerloo"}, {"source": 146, "target": 217, "line": "central"}, {"source": 146, "target": 20, "line": "central"}, {"source": 147, "target": 80, "line": "northern"}, {"source": 148, "target": 228, "line": "circle"}, {"source": 148, "target": 38, "line": "circle"}, {"source": 149, "target": 55, "line": "metropolitan"}, {"source": 149, "target": 190, "line": "metropolitan"}, {"source": 149, "target": 162, "line": "metropolitan"}, {"source": 150, "target": 138, "line": "metropolitan"}, {"source": 150, "target": 12, "line": "metropolitan"}, {"source": 150, "target": 138, "line": "circle"}, {"source": 150, "target": 12, "line": "circle"}, {"source": 150, "target": 11, "line": "northern"}, {"source": 150, "target": 166, "line": "northern"}, {"source": 151, "target": 208, "line": "northern"}, {"source": 152, "target": 76, "line": "northern"}, {"source": 152, "target": 34, "line": "northern"}, {"source": 153, "target": 246, "line": "jubilee"}, {"source": 153, "target": 59, "line": "jubilee"}, {"source": 154, "target": 84, "line": "central"}, {"source": 154, "target": 14, "line": "central"}, {"source": 155, "target": 97, "line": "central"}, {"source": 155, "target": 63, "line": "central"}, {"source": 155, "target": 247, "line": "central"}, {"source": 156, "target": 68, "line": "piccadilly"}, {"source": 156, "target": 172, "line": "piccadilly"}, {"source": 157, "target": 189, "line": "piccadilly"}, {"source": 157, "target": 25, "line": "piccadilly"}, {"source": 158, "target": 36, "line": "jubilee"}, {"source": 158, "target": 37, "line": "jubilee"}, {"source": 159, "target": 177, "line": "metropolitan"}, {"source": 159, "target": 100, "line": "metropolitan"}, {"source": 160, "target": 206, "line": "central"}, {"source": 160, "target": 90, "line": "central"}, {"source": 161, "target": 100, "line": "metropolitan"}, {"source": 161, "target": 179, "line": "metropolitan"}, {"source": 162, "target": 149, "line": "metropolitan"}, {"source": 162, "target": 163, "line": "metropolitan"}, {"source": 163, "target": 162, "line": "metropolitan"}, {"source": 163, "target": 177, "line": "metropolitan"}, {"source": 164, "target": 112, "line": "central"}, {"source": 164, "target": 183, "line": "central"}, {"source": 164, "target": 16, "line": "circle"}, {"source": 164, "target": 109, "line": "circle"}, {"source": 165, "target": 51, "line": "piccadilly"}, {"source": 165, "target": 203, "line": "piccadilly"}, {"source": 166, "target": 150, "line": "northern"}, {"source": 166, "target": 5, "line": "northern"}, {"source": 167, "target": 25, "line": "piccadilly"}, {"source": 167, "target": 116, "line": "piccadilly"}, {"source": 168, "target": 120, "line": "northern"}, {"source": 168, "target": 215, "line": "northern"}, {"source": 169, "target": 175, "line": "bakerloo"}, {"source": 169, "target": 187, "line": "bakerloo"}, {"source": 169, "target": 91, "line": "victoria"}, {"source": 169, "target": 241, "line": "victoria"}, {"source": 169, "target": 225, "line": "central"}, {"source": 169, "target": 23, "line": "central"}, {"source": 170, "target": 71, "line": "bakerloo"}, {"source": 170, "target": 242, "line": "bakerloo"}, {"source": 170, "target": 171, "line": "circle"}, {"source": 170, "target": 70, "line": "circle"}, {"source": 171, "target": 16, "line": "circle"}, {"source": 171, "target": 170, "line": "circle"}, {"source": 172, "target": 3, "line": "piccadilly"}, {"source": 172, "target": 156, "line": "piccadilly"}, {"source": 174, "target": 90, "line": "central"}, {"source": 175, "target": 169, "line": "bakerloo"}, {"source": 175, "target": 43, "line": "bakerloo"}, {"source": 175, "target": 135, "line": "piccadilly"}, {"source": 175, "target": 91, "line": "piccadilly"}, {"source": 176, "target": 237, "line": "victoria"}, {"source": 176, "target": 238, "line": "victoria"}, {"source": 177, "target": 163, "line": "metropolitan"}, {"source": 177, "target": 159, "line": "metropolitan"}, {"source": 179, "target": 161, "line": "metropolitan"}, {"source": 179, "target": 246, "line": "metropolitan"}, {"source": 181, "target": 127, "line": "bakerloo"}, {"source": 181, "target": 121, "line": "bakerloo"}, {"source": 182, "target": 39, "line": "jubilee"}, {"source": 182, "target": 128, "line": "jubilee"}, {"source": 183, "target": 133, "line": "central"}, {"source": 183, "target": 164, "line": "central"}, {"source": 185, "target": 252, "line": "metropolitan"}, {"source": 185, "target": 64, "line": "metropolitan"}, {"source": 185, "target": 252, "line": "piccadilly"}, {"source": 185, "target": 64, "line": "piccadilly"}, {"source": 186, "target": 240, "line": "central"}, {"source": 186, "target": 84, "line": "central"}, {"source": 187, "target": 169, "line": "bakerloo"}, {"source": 187, "target": 9, "line": "bakerloo"}, {"source": 189, "target": 157, "line": "piccadilly"}, {"source": 189, "target": 0, "line": "piccadilly"}, {"source": 190, "target": 47, "line": "metropolitan"}, {"source": 190, "target": 149, "line": "metropolitan"}, {"source": 191, "target": 45, "line": "central"}, {"source": 191, "target": 262, "line": "central"}, {"source": 193, "target": 119, "line": "metropolitan"}, {"source": 193, "target": 195, "line": "metropolitan"}, {"source": 193, "target": 119, "line": "piccadilly"}, {"source": 195, "target": 193, "line": "metropolitan"}, {"source": 195, "target": 64, "line": "metropolitan"}, {"source": 195, "target": 193, "line": "piccadilly"}, {"source": 195, "target": 64, "line": "piccadilly"}, {"source": 196, "target": 111, "line": "piccadilly"}, {"source": 196, "target": 129, "line": "piccadilly"}, {"source": 197, "target": 226, "line": "victoria"}, {"source": 197, "target": 82, "line": "victoria"}, {"source": 198, "target": 257, "line": "central"}, {"source": 198, "target": 112, "line": "central"}, {"source": 200, "target": 238, "line": "circle"}, {"source": 200, "target": 205, "line": "circle"}, {"source": 201, "target": 137, "line": "central"}, {"source": 201, "target": 240, "line": "central"}, {"source": 201, "target": 262, "line": "central"}, {"source": 203, "target": 7, "line": "piccadilly"}, {"source": 203, "target": 165, "line": "piccadilly"}, {"source": 204, "target": 218, "line": "piccadilly"}, {"source": 204, "target": 252, "line": "piccadilly"}, {"source": 205, "target": 85, "line": "piccadilly"}, {"source": 205, "target": 130, "line": "piccadilly"}, {"source": 205, "target": 85, "line": "circle"}, {"source": 205, "target": 200, "line": "circle"}, {"source": 206, "target": 160, "line": "central"}, {"source": 207, "target": 243, "line": "jubilee"}, {"source": 207, "target": 139, "line": "jubilee"}, {"source": 208, "target": 151, "line": "northern"}, {"source": 208, "target": 53, "line": "northern"}, {"source": 210, "target": 39, "line": "jubilee"}, {"source": 212, "target": 254, "line": "circle"}, {"source": 212, "target": 238, "line": "circle"}, {"source": 213, "target": 220, "line": "jubilee"}, {"source": 213, "target": 9, "line": "jubilee"}, {"source": 214, "target": 42, "line": "central"}, {"source": 214, "target": 11, "line": "central"}, {"source": 215, "target": 49, "line": "northern"}, {"source": 215, "target": 168, "line": "northern"}, {"source": 215, "target": 29, "line": "victoria"}, {"source": 215, "target": 237, "line": "victoria"}, {"source": 216, "target": 98, "line": "bakerloo"}, {"source": 216, "target": 245, "line": "bakerloo"}, {"source": 217, "target": 146, "line": "central"}, {"source": 217, "target": 136, "line": "central"}, {"source": 217, "target": 250, "line": "jubilee"}, {"source": 218, "target": 219, "line": "piccadilly"}, {"source": 218, "target": 204, "line": "piccadilly"}, {"source": 219, "target": 3, "line": "piccadilly"}, {"source": 219, "target": 218, "line": "piccadilly"}, {"source": 220, "target": 81, "line": "jubilee"}, {"source": 220, "target": 213, "line": "jubilee"}, {"source": 221, "target": 74, "line": "circle"}, {"source": 221, "target": 21, "line": "circle"}, {"source": 222, "target": 75, "line": "central"}, {"source": 222, "target": 58, "line": "central"}, {"source": 223, "target": 224, "line": "northern"}, {"source": 223, "target": 50, "line": "northern"}, {"source": 224, "target": 53, "line": "northern"}, {"source": 224, "target": 223, "line": "northern"}, {"source": 225, "target": 135, "line": "northern"}, {"source": 225, "target": 241, "line": "northern"}, {"source": 225, "target": 111, "line": "central"}, {"source": 225, "target": 169, "line": "central"}, {"source": 226, "target": 22, "line": "victoria"}, {"source": 226, "target": 197, "line": "victoria"}, {"source": 227, "target": 264, "line": "northern"}, {"source": 227, "target": 106, "line": "northern"}, {"source": 228, "target": 1, "line": "circle"}, {"source": 228, "target": 148, "line": "circle"}, {"source": 229, "target": 6, "line": "northern"}, {"source": 229, "target": 123, "line": "northern"}, {"source": 231, "target": 142, "line": "piccadilly"}, {"source": 231, "target": 263, "line": "piccadilly"}, {"source": 236, "target": 110, "line": "metropolitan"}, {"source": 236, "target": 110, "line": "piccadilly"}, {"source": 237, "target": 176, "line": "victoria"}, {"source": 237, "target": 215, "line": "victoria"}, {"source": 238, "target": 200, "line": "circle"}, {"source": 238, "target": 212, "line": "circle"}, {"source": 238, "target": 91, "line": "victoria"}, {"source": 238, "target": 176, "line": "victoria"}, {"source": 239, "target": 22, "line": "victoria"}, {"source": 240, "target": 201, "line": "central"}, {"source": 240, "target": 186, "line": "central"}, {"source": 241, "target": 225, "line": "northern"}, {"source": 241, "target": 76, "line": "northern"}, {"source": 241, "target": 169, "line": "victoria"}, {"source": 241, "target": 76, "line": "victoria"}, {"source": 242, "target": 170, "line": "bakerloo"}, {"source": 242, "target": 141, "line": "bakerloo"}, {"source": 243, "target": 132, "line": "bakerloo"}, {"source": 243, "target": 74, "line": "northern"}, {"source": 243, "target": 120, "line": "northern"}, {"source": 243, "target": 254, "line": "jubilee"}, {"source": 243, "target": 207, "line": "jubilee"}, {"source": 244, "target": 55, "line": "metropolitan"}, {"source": 245, "target": 360, "line": "bakerloo"}, {"source": 246, "target": 179, "line": "metropolitan"}, {"source": 246, "target": 81, "line": "metropolitan"}, {"source": 246, "target": 153, "line": "jubilee"}, {"source": 246, "target": 128, "line": "jubilee"}, {"source": 247, "target": 155, "line": "central"}, {"source": 247, "target": 60, "line": "central"}, {"source": 249, "target": 264, "line": "northern"}, {"source": 249, "target": 80, "line": "northern"}, {"source": 251, "target": 126, "line": "jubilee"}, {"source": 251, "target": 81, "line": "jubilee"}, {"source": 252, "target": 100, "line": "metropolitan"}, {"source": 252, "target": 185, "line": "metropolitan"}, {"source": 252, "target": 204, "line": "piccadilly"}, {"source": 252, "target": 185, "line": "piccadilly"}, {"source": 254, "target": 212, "line": "circle"}, {"source": 254, "target": 74, "line": "circle"}, {"source": 254, "target": 91, "line": "jubilee"}, {"source": 254, "target": 243, "line": "jubilee"}, {"source": 257, "target": 198, "line": "central"}, {"source": 258, "target": 59, "line": "jubilee"}, {"source": 258, "target": 126, "line": "jubilee"}, {"source": 259, "target": 98, "line": "bakerloo"}, {"source": 259, "target": 121, "line": "bakerloo"}, {"source": 262, "target": 31, "line": "central"}, {"source": 262, "target": 191, "line": "central"}, {"source": 263, "target": 231, "line": "piccadilly"}, {"source": 263, "target": 26, "line": "piccadilly"}, {"source": 264, "target": 227, "line": "northern"}, {"source": 264, "target": 249, "line": "northern"}, {"source": 265, "target": 299, "line": "dlr"}, {"source": 266, "target": 285, "line": "dlr"}, {"source": 266, "target": 290, "line": "dlr"}, {"source": 267, "target": 280, "line": "dlr"}, {"source": 268, "target": 275, "line": "dlr"}, {"source": 268, "target": 293, "line": "dlr"}, {"source": 269, "target": 278, "line": "dlr"}, {"source": 269, "target": 290, "line": "dlr"}, {"source": 270, "target": 277, "line": "dlr"}, {"source": 270, "target": 292, "line": "dlr"}, {"source": 271, "target": 297, "line": "dlr"}, {"source": 271, "target": 294, "line": "dlr"}, {"source": 271, "target": 305, "line": "dlr"}, {"source": 272, "target": 288, "line": "dlr"}, {"source": 272, "target": 296, "line": "dlr"}, {"source": 273, "target": 291, "line": "dlr"}, {"source": 273, "target": 294, "line": "dlr"}, {"source": 274, "target": 283, "line": "dlr"}, {"source": 274, "target": 281, "line": "dlr"}, {"source": 275, "target": 280, "line": "dlr"}, {"source": 275, "target": 268, "line": "dlr"}, {"source": 276, "target": 279, "line": "dlr"}, {"source": 276, "target": 281, "line": "dlr"}, {"source": 277, "target": 285, "line": "dlr"}, {"source": 277, "target": 270, "line": "dlr"}, {"source": 278, "target": 269, "line": "dlr"}, {"source": 278, "target": 271, "line": "dlr"}, {"source": 279, "target": 286, "line": "dlr"}, {"source": 279, "target": 276, "line": "dlr"}, {"source": 280, "target": 275, "line": "dlr"}, {"source": 280, "target": 267, "line": "dlr"}, {"source": 281, "target": 276, "line": "dlr"}, {"source": 281, "target": 274, "line": "dlr"}, {"source": 282, "target": 296, "line": "dlr"}, {"source": 282, "target": 304, "line": "dlr"}, {"source": 283, "target": 288, "line": "dlr"}, {"source": 283, "target": 274, "line": "dlr"}, {"source": 284, "target": 287, "line": "dlr"}, {"source": 284, "target": 306, "line": "dlr"}, {"source": 285, "target": 266, "line": "dlr"}, {"source": 285, "target": 277, "line": "dlr"}, {"source": 286, "target": 279, "line": "dlr"}, {"source": 287, "target": 289, "line": "dlr"}, {"source": 287, "target": 284, "line": "dlr"}, {"source": 288, "target": 272, "line": "dlr"}, {"source": 288, "target": 283, "line": "dlr"}, {"source": 289, "target": 305, "line": "dlr"}, {"source": 289, "target": 287, "line": "dlr"}, {"source": 290, "target": 269, "line": "dlr"}, {"source": 290, "target": 304, "line": "dlr"}, {"source": 290, "target": 266, "line": "dlr"}, {"source": 290, "target": 302, "line": "dlr"}, {"source": 291, "target": 293, "line": "dlr"}, {"source": 291, "target": 273, "line": "dlr"}, {"source": 292, "target": 299, "line": "dlr"}, {"source": 292, "target": 270, "line": "dlr"}, {"source": 293, "target": 268, "line": "dlr"}, {"source": 293, "target": 291, "line": "dlr"}, {"source": 294, "target": 273, "line": "dlr"}, {"source": 294, "target": 271, "line": "dlr"}, {"source": 295, "target": 301, "line": "dlr"}, {"source": 295, "target": 302, "line": "dlr"}, {"source": 296, "target": 282, "line": "dlr"}, {"source": 296, "target": 272, "line": "dlr"}, {"source": 297, "target": 303, "line": "dlr"}, {"source": 297, "target": 271, "line": "dlr"}, {"source": 298, "target": 300, "line": "dlr"}, {"source": 298, "target": 299, "line": "dlr"}, {"source": 299, "target": 298, "line": "dlr"}, {"source": 299, "target": 292, "line": "dlr"}, {"source": 299, "target": 265, "line": "dlr"}, {"source": 300, "target": 298, "line": "dlr"}, {"source": 301, "target": 295, "line": "dlr"}, {"source": 302, "target": 295, "line": "dlr"}, {"source": 302, "target": 290, "line": "dlr"}, {"source": 303, "target": 297, "line": "dlr"}, {"source": 304, "target": 290, "line": "dlr"}, {"source": 304, "target": 282, "line": "dlr"}, {"source": 305, "target": 289, "line": "dlr"}, {"source": 306, "target": 284, "line": "dlr"}, {"source": 194, "target": 206, "line": "central"}, {"source": 13, "target": 66, "line": "hammersmith-city"}, {"source": 66, "target": 235, "line": "hammersmith-city"}, {"source": 235, "target": 178, "line": "hammersmith-city"}, {"source": 178, "target": 250, "line": "hammersmith-city"}, {"source": 250, "target": 30, "line": "hammersmith-city"}, {"source": 30, "target": 27, "line": "hammersmith-city"}, {"source": 27, "target": 146, "line": "hammersmith-city"}, {"source": 146, "target": 211, "line": "hammersmith-city"}, {"source": 211, "target": 256, "line": "hammersmith-city"}, {"source": 256, "target": 2, "line": "hammersmith-city"}, {"source": 2, "target": 138, "line": "hammersmith-city"}, {"source": 138, "target": 150, "line": "hammersmith-city"}, {"source": 150, "target": 12, "line": "hammersmith-city"}, {"source": 12, "target": 79, "line": "hammersmith-city"}, {"source": 79, "target": 129, "line": "hammersmith-city"}, {"source": 129, "target": 77, "line": "hammersmith-city"}, {"source": 77, "target": 89, "line": "hammersmith-city"}, {"source": 89, "target": 9, "line": "hammersmith-city"}, {"source": 9, "target": 70, "line": "hammersmith-city"}, {"source": 70, "target": 170, "line": "hammersmith-city"}, {"source": 170, "target": 192, "line": "hammersmith-city"}, {"source": 192, "target": 131, "line": "hammersmith-city"}, {"source": 131, "target": 134, "line": "hammersmith-city"}, {"source": 134, "target": 199, "line": "hammersmith-city"}, {"source": 199, "target": 87, "line": "hammersmith-city"}, {"source": 87, "target": 95, "line": "hammersmith-city"}, {"source": 365, "target": 327, "line": "liberty"}, {"source": 327, "target": 387, "line": "liberty"}, {"source": 76, "target": 375, "line": "lioness"}, {"source": 375, "target": 353, "line": "lioness"}, {"source": 353, "target": 181, "line": "lioness"}, {"source": 181, "target": 121, "line": "lioness"}, {"source": 121, "target": 259, "line": "lioness"}, {"source": 259, "target": 98, "line": "lioness"}, {"source": 98, "target": 380, "line": "lioness"}, {"source": 380, "target": 245, "line": "lioness"}, {"source": 245, "target": 360, "line": "lioness"}, {"source": 360, "target": 376, "line": "lioness"}, {"source": 376, "target": 124, "line": "lioness"}, {"source": 124, "target": 99, "line": "lioness"}, {"source": 99, "target": 342, "line": "lioness"}, {"source": 342, "target": 341, "line": "lioness"}, {"source": 341, "target": 316, "line": "lioness"}, {"source": 316, "target": 434, "line": "lioness"}, {"source": 434, "target": 392, "line": "lioness"}, {"source": 392, "target": 393, "line": "lioness"}, {"source": 364, "target": 352, "line": "mildmay"}, {"source": 352, "target": 92, "line": "mildmay"}, {"source": 92, "target": 373, "line": "mildmay"}, {"source": 373, "target": 307, "line": "mildmay"}, {"source": 307, "target": 398, "line": "mildmay"}, {"source": 398, "target": 436, "line": "mildmay"}, {"source": 436, "target": 310, "line": "mildmay"}, {"source": 310, "target": 309, "line": "mildmay"}, {"source": 309, "target": 396, "line": "mildmay"}, {"source": 396, "target": 330, "line": "mildmay"}, {"source": 330, "target": 337, "line": "mildmay"}, {"source": 337, "target": 332, "line": "mildmay"}, {"source": 332, "target": 123, "line": "mildmay"}, {"source": 123, "target": 314, "line": "mildmay"}, {"source": 314, "target": 313, "line": "mildmay"}, {"source": 313, "target": 107, "line": "mildmay"}, {"source": 107, "target": 315, "line": "mildmay"}, {"source": 315, "target": 324, "line": "mildmay"}, {"source": 324, "target": 334, "line": "mildmay"}, {"source": 334, "target": 345, "line": "mildmay"}, {"source": 345, "target": 427, "line": "mildmay"}, {"source": 427, "target": 217, "line": "mildmay"}, {"source": 398, "target": 370, "line": "mildmay"}, {"source": 370, "target": 122, "line": "mildmay"}, {"source": 122, "target": 248, "line": "mildmay"}, {"source": 248, "target": 348, "line": "mildmay"}, {"source": 348, "target": 428, "line": "mildmay"}, {"source": 332, "target": 386, "line": "suffragette"}, {"source": 386, "target": 321, "line": "suffragette"}, {"source": 321, "target": 339, "line": "suffragette"}, {"source": 339, "target": 377, "line": "suffragette"}, {"source": 377, "target": 22, "line": "suffragette"}, {"source": 22, "target": 389, "line": "suffragette"}, {"source": 389, "target": 354, "line": "suffragette"}, {"source": 354, "target": 355, "line": "suffragette"}, {"source": 355, "target": 435, "line": "suffragette"}, {"source": 435, "target": 399, "line": "suffragette"}, {"source": 399, "target": 13, "line": "suffragette"}, {"source": 13, "target": 426, "line": "suffragette"}, {"source": 138, "target": 433, "line": "weaver"}, {"source": 433, "target": 432, "line": "weaver"}, {"source": 432, "target": 357, "line": "weaver"}, {"source": 357, "target": 335, "line": "weaver"}, {"source": 335, "target": 363, "line": "weaver"}, {"source": 363, "target": 379, "line": "weaver"}, {"source": 379, "target": 378, "line": "weaver"}, {"source": 378, "target": 197, "line": "weaver"}, {"source": 197, "target": 311, "line": "weaver"}, {"source": 311, "target": 397, "line": "weaver"}, {"source": 397, "target": 372, "line": "weaver"}, {"source": 372, "target": 326, "line": "weaver"}, {"source": 326, "target": 374, "line": "weaver"}, {"source": 374, "target": 385, "line": "weaver"}, {"source": 385, "target": 384, "line": "weaver"}, {"source": 384, "target": 317, "line": "weaver"}, {"source": 326, "target": 312, "line": "weaver"}, {"source": 312, "target": 328, "line": "weaver"}, {"source": 335, "target": 320, "line": "weaver"}, {"source": 320, "target": 367, "line": "weaver"}, {"source": 367, "target": 239, "line": "weaver"}, {"source": 239, "target": 400, "line": "weaver"}, {"source": 400, "target": 343, "line": "weaver"}, {"source": 343, "target": 318, "line": "weaver"}, {"source": 107, "target": 315, "line": "windrush"}, {"source": 315, "target": 323, "line": "windrush"}, {"source": 323, "target": 336, "line": "windrush"}, {"source": 336, "target": 347, "line": "windrush"}, {"source": 347, "target": 371, "line": "windrush"}, {"source": 371, "target": 256, "line": "windrush"}, {"source": 256, "target": 369, "line": "windrush"}, {"source": 369, "target": 391, "line": "windrush"}, {"source": 391, "target": 366, "line": "windrush"}, {"source": 366, "target": 35, "line": "windrush"}, {"source": 35, "target": 382, "line": "windrush"}, {"source": 382, "target": 358, "line": "windrush"}, {"source": 382, "target": 429, "line": "windrush"}, {"source": 429, "target": 430, "line": "windrush"}, {"source": 430, "target": 325, "line": "windrush"}, {"source": 325, "target": 319, "line": "windrush"}, {"source": 319, "target": 390, "line": "windrush"}, {"source": 390, "target": 428, "line": "windrush"}, {"source": 382, "target": 359, "line": "windrush"}, {"source": 359, "target": 431, "line": "windrush"}, {"source": 431, "target": 346, "line": "windrush"}, {"source": 346, "target": 331, "line": "windrush"}, {"source": 331, "target": 383, "line": "windrush"}, {"source": 383, "target": 362, "line": "windrush"}, {"source": 362, "target": 308, "line": "windrush"}, {"source": 308, "target": 361, "line": "windrush"}, {"source": 361, "target": 395, "line": "windrush"}, {"source": 383, "target": 322, "line": "windrush"}, {"source": 102, "target": 402, "line": "elizabeth-line"}, {"source": 402, "target": 403, "line": "elizabeth-line"}, {"source": 403, "target": 404, "line": "elizabeth-line"}, {"source": 404, "target": 405, "line": "elizabeth-line"}, {"source": 405, "target": 60, "line": "elizabeth-line"}, {"source": 60, "target": 407, "line": "elizabeth-line"}, {"source": 407, "target": 170, "line": "elizabeth-line"}, {"source": 170, "target": 23, "line": "elizabeth-line"}, {"source": 23, "target": 225, "line": "elizabeth-line"}, {"source": 225, "target": 79, "line": "elizabeth-line"}, {"source": 79, "target": 138, "line": "elizabeth-line"}, {"source": 138, "target": 256, "line": "elizabeth-line"}, {"source": 256, "target": 217, "line": "elizabeth-line"}, {"source": 217, "target": 420, "line": "elizabeth-line"}, {"source": 420, "target": 419, "line": "elizabeth-line"}, {"source": 419, "target": 418, "line": "elizabeth-line"}, {"source": 418, "target": 417, "line": "elizabeth-line"}, {"source": 417, "target": 416, "line": "elizabeth-line"}, {"source": 416, "target": 415, "line": "elizabeth-line"}, {"source": 415, "target": 414, "line": "elizabeth-line"}, {"source": 414, "target": 413, "line": "elizabeth-line"}, {"source": 413, "target": 412, "line": "elizabeth-line"}, {"source": 412, "target": 411, "line": "elizabeth-line"}, {"source": 411, "target": 410, "line": "elizabeth-line"}, {"source": 410, "target": 409, "line": "elizabeth-line"}, {"source": 256, "target": 425, "line": "elizabeth-line"}, {"source": 425, "target": 273, "line": "elizabeth-line"}, {"source": 273, "target": 424, "line": "elizabeth-line"}, {"source": 424, "target": 423, "line": "elizabeth-line"}, {"source": 62, "target": 248, "line": "district"}, {"source": 248, "target": 83, "line": "district"}, {"source": 83, "target": 173, "line": "district"}, {"source": 173, "target": 180, "line": "district"}, {"source": 180, "target": 67, "line": "district"}, {"source": 67, "target": 202, "line": "district"}, {"source": 202, "target": 261, "line": "district"}, {"source": 261, "target": 260, "line": "district"}, {"source": 62, "target": 253, "line": "district"}, {"source": 253, "target": 15, "line": "district"}, {"source": 15, "target": 94, "line": "district"}, {"source": 94, "target": 184, "line": "district"}, {"source": 184, "target": 209, "line": "district"}, {"source": 209, "target": 230, "line": "district"}, {"source": 230, "target": 92, "line": "district"}, {"source": 92, "target": 125, "line": "district"}, {"source": 125, "target": 188, "line": "district"}, {"source": 230, "target": 0, "line": "district"}, {"source": 0, "target": 61, "line": "district"}, {"source": 61, "target": 60, "line": "district"}, {"source": 62, "target": 109, "line": "district"}, {"source": 109, "target": 164, "line": "district"}, {"source": 164, "target": 16, "line": "district"}, {"source": 16, "target": 171, "line": "district"}, {"source": 171, "target": 70, "line": "district"}, {"source": 62, "target": 85, "line": "district"}, {"source": 85, "target": 205, "line": "district"}, {"source": 205, "target": 200, "line": "district"}, {"source": 200, "target": 238, "line": "district"}, {"source": 238, "target": 212, "line": "district"}, {"source": 212, "target": 254, "line": "district"}, {"source": 254, "target": 74, "line": "district"}, {"source": 74, "target": 221, "line": "district"}, {"source": 221, "target": 21, "line": "district"}, {"source": 21, "target": 143, "line": "district"}, {"source": 143, "target": 38, "line": "district"}, {"source": 38, "target": 148, "line": "district"}, {"source": 148, "target": 228, "line": "district"}, {"source": 228, "target": 2, "line": "district"}, {"source": 2, "target": 256, "line": "district"}, {"source": 256, "target": 211, "line": "district"}, {"source": 211, "target": 146, "line": "district"}, {"source": 146, "target": 27, "line": "district"}, {"source": 27, "target": 30, "line": "district"}, {"source": 30, "target": 250, "line": "district"}, {"source": 250, "target": 178, "line": "district"}, {"source": 178, "target": 235, "line": "district"}, {"source": 235, "target": 66, "line": "district"}, {"source": 66, "target": 13, "line": "district"}, {"source": 13, "target": 234, "line": "district"}, {"source": 234, "target": 17, "line": "district"}, {"source": 17, "target": 57, "line": "district"}, {"source": 57, "target": 56, "line": "district"}, {"source": 56, "target": 73, "line": "district"}, {"source": 73, "target": 114, "line": "district"}, {"source": 114, "target": 233, "line": "district"}, {"source": 233, "target": 232, "line": "district"}, {"source": 62, "target": 122, "line": "district"}, {"source": 70, "target": 170, "line": "circle"}, {"source": 170, "target": 192, "line": "circle"}, {"source": 192, "target": 131, "line": "circle"}, {"source": 131, "target": 134, "line": "circle"}, {"source": 134, "target": 199, "line": "circle"}, {"source": 199, "target": 87, "line": "circle"}, {"source": 87, "target": 95, "line": "circle"},
    
    // NEW: Elizabeth Line extension links
    {"source": 402, "target": 500, "line": "elizabeth-line"},
    {"source": 500, "target": 501, "line": "elizabeth-line"},
    {"source": 501, "target": 502, "line": "elizabeth-line"},
    {"source": 502, "target": 503, "line": "elizabeth-line"},
    {"source": 503, "target": 504, "line": "elizabeth-line"},
    {"source": 504, "target": 505, "line": "elizabeth-line"},
    {"source": 505, "target": 506, "line": "elizabeth-line"},
    {"source": 506, "target": 507, "line": "elizabeth-line"},
    {"source": 507, "target": 508, "line": "elizabeth-line"}]
};


/**
 * Fetches all necessary data.
 */
async function fetchData() {
    try {
        const statusResponse = await fetch('https://api.tfl.gov.uk/line/mode/tube,overground,dlr,elizabeth-line,national-rail/status');
        if (!statusResponse.ok) throw new Error(`Failed to fetch line status: ${statusResponse.statusText}`);
        let lineStatuses = await statusResponse.json();

        Object.keys(LOCAL_LINE_COLORS_DATA).forEach(lineId => {
            lineColors[lineId] = LOCAL_LINE_COLORS_DATA[lineId].color;
        });

        displayLineStatus(lineStatuses);
        processNetworkData(LOCAL_NETWORK_DATA);
        populateStationSelects(allStations);
        initializeMap();
        drawAllLines();
        addStationMarkers();

    } catch (error) {
        console.error("Error fetching data:", error);
        lineStatusContainer.innerHTML = `<div class="text-red-500">Could not load live data. Please try again later.</div>`;
    }
}

/**
 * Processes the static network data to build our station and line connection graphs.
 */
function processNetworkData(networkData) {
     const lineNameMapping = {
        "bakerloo": "bakerloo", "central": "central", "circle": "circle",
        "district": "district",
        "hammersmith-and-city": "hammersmith-and-city",
        "hammersmith-city": "hammersmith-and-city",
        "jubilee": "jubilee", "metropolitan": "metropolitan", "northern": "northern",
        "piccadilly": "piccadilly", "victoria": "victoria",
        "waterloo-and-city": "waterloo-and-city",
        "waterloo-city": "waterloo-and-city",
        "dlr": "dlr", "elizabeth-line": "elizabeth-line",
        "liberty": "liberty", "lioness": "lioness", "mildmay": "mildmay",
        "suffragette": "suffragette", "weaver": "weaver", "windrush": "windrush",
        "interchange": "interchange"
    };

    const uniqueStations = new Map();
    // Create a name mapping for stations that should be treated as one, e.g., 'Edgware Road'
    const stationNameOverrides = {
        "Edgware Road (Bakerloo)": "Edgware Road",
    };

    networkData.nodes.forEach(node => {
        let stationName = stationNameOverrides[node.name] || node.name;
        stationName = stationName.replace(/\s*\(.*?elizabeth.*?\)\s*/i, '').trim();

        if (!uniqueStations.has(stationName)) {
            uniqueStations.set(stationName, {
                id: node.id, name: stationName, lat: node.position[1], lon: node.position[0]
            });
        }
        stationsCoords[node.name] = { lat: node.position[1], lon: node.position[0] };
    });
    allStations = Array.from(uniqueStations.values()).sort((a, b) => a.name.localeCompare(b.name));

    const tempLinesData = {};
    networkData.links.forEach(link => {
        const fromNode = networkData.nodes.find(n => n.id === link.source);
        const toNode = networkData.nodes.find(n => n.id === link.target);
        const lineId = lineNameMapping[link.line];

        if (fromNode && toNode && lineId) {
            let fromName = stationNameOverrides[fromNode.name] || fromNode.name;
            fromName = fromName.replace(/\s*\(.*?elizabeth.*?\)\s*/i, '').trim();
            let toName = stationNameOverrides[toNode.name] || toNode.name;
            toName = toName.replace(/\s*\(.*?elizabeth.*?\)\s*/i, '').trim();

            if (!tempLinesData[lineId]) tempLinesData[lineId] = { stations: new Set(), connections: {} };
            tempLinesData[lineId].stations.add(fromName);
            tempLinesData[lineId].stations.add(toName);
            if (!tempLinesData[lineId].connections[fromName]) tempLinesData[lineId].connections[fromName] = [];
            if (!tempLinesData[lineId].connections[toName]) tempLinesData[lineId].connections[toName] = [];
            if (!tempLinesData[lineId].connections[fromName].includes(toName)) tempLinesData[lineId].connections[fromName].push(toName);
            if (!tempLinesData[lineId].connections[toName].includes(fromName)) tempLinesData[lineId].connections[toName].push(fromName);
        }
    });
    
    for (const lineId in tempLinesData) {
        linesData[lineId] = {
            name: LOCAL_LINE_COLORS_DATA[lineId]?.name || lineId,
            stations: Array.from(tempLinesData[lineId].stations),
            connections: tempLinesData[lineId].connections
        };
    }
}

function populateStationSelects(stations) {
    const options = stations.map(station => `<option value="${station.name}">${station.name}</option>`).join('');
    startStationSelect.innerHTML = `<option value="" disabled selected>Select start station</option>${options}`;
    endStationSelect.innerHTML = `<option value="" disabled selected>Select end station</option>${options}`;
}

function displayLineStatus(statuses) {
    const allStatuses = statuses
        .filter(line => line.id !== 'london-overground' && line.id !== 'tfl-rail')
        .map(line => ({ ...line, id: line.id.replace('-line', '') }))
        .filter(line => LOCAL_LINE_COLORS_DATA[line.id])
        .sort((a, b) => LOCAL_LINE_COLORS_DATA[a.id].name.localeCompare(LOCAL_LINE_COLORS_DATA[b.id].name));

    const statusHtml = allStatuses.map(line => {
        const status = line.lineStatuses[0];
        const severity = status.statusSeverityDescription.replace(/ /g, '-').toLowerCase();
        const color = lineColors[line.id] || '#D1D5DB';
        const displayName = LOCAL_LINE_COLORS_DATA[line.id].name;

        return `
            <div class="line-status-item relative p-3 pl-6 rounded-md hover:bg-gray-700/60 transition-colors duration-200 overflow-hidden border border-gray-700/50" onclick="window.highlightLine('${line.id}')">
                <div class="line-status-color-bar" style="background-color: ${color};"></div>
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-white">${displayName}</span>
                    <div class="flex items-center text-sm text-gray-300">
                        <span class="status-indicator ${severity}"></span>
                        <span>${status.statusSeverityDescription}</span>
                    </div>
                </div>
                ${status.reason ? `<p class="text-xs text-gray-400 mt-1 pl-1">${status.reason}</p>` : ''}
            </div>
        `;
    }).join('');

    lineStatusContainer.innerHTML = statusHtml || '<div class="text-gray-500">Could not display line statuses.</div>';
}

function initializeMap() {
    if (map) return;
    map = L.map('map').setView([51.5074, -0.1278], 12);

    map.createPane('tilePane');
    map.getPane('tilePane').style.zIndex = 200;
    map.createPane('networkPane');
    map.getPane('networkPane').style.zIndex = 350;
    map.createPane('routePane');
    map.getPane('routePane').style.zIndex = 400;
    map.createPane('highlightPane');
    map.getPane('highlightPane').style.zIndex = 500;
    map.createPane('markerPane');
    map.getPane('markerPane').style.zIndex = 650;
    map.createPane('popupPane');
    map.getPane('popupPane').style.zIndex = 700;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        pane: 'tilePane'
    }).addTo(map);
    
    networkLinesLayerGroup = L.layerGroup({pane: 'networkPane'}).addTo(map);
    routeLayerGroup = L.layerGroup({pane: 'routePane'}).addTo(map);
    markerLayerGroup = L.featureGroup({pane: 'markerPane'}).addTo(map);
    highlightLayer = L.layerGroup({pane: 'highlightPane'}).addTo(map);

    map.on('click', () => {
        routeLayerGroup.clearLayers();
        highlightLayer.clearLayers();
        routeInfoContainer.classList.add('hidden');
        drawAllLines();
    });
}

function createPopupContent(station) {
    let content = `<b class="text-lg">${station.name}</b><hr class="my-2 border-gray-600">`;
    const servingLines = new Map();
    for(const lineId in linesData) {
        if (lineId === 'interchange') continue;
        const line = linesData[lineId];
        // FIX: Use exact match to prevent 'Edgware' matching 'Edgware Road'
        if(line.stations.some(s => s === station.name)) {
            if (!servingLines.has(line.name)) {
                servingLines.set(line.name, { name: line.name, id: lineId });
            }
        }
    }
    if(servingLines.size > 0) {
        content += '<div>' + Array.from(servingLines.values()).sort((a, b) => a.name.localeCompare(b.name)).map(line => 
            `<span class="line-pill" style="background-color: ${lineColors[line.id] || '#808080'}" onclick="window.highlightLine('${line.id}')">${line.name}</span>`
        ).join('') + '</div>';
    }
    const journeysToStation = journeysData.filter(j => j.to === station.name);
    if(journeysToStation.length > 0) {
        content += `<h4 class="font-semibold mt-3 mb-1">Journeys To Here:</h4><ul class="list-disc list-inside max-h-28 overflow-y-auto text-sm">`;
        journeysToStation.forEach(j => { content += `<li>From ${j.from} on ${j.date}</li>`; });
        content += '</ul>';
    }
    return content;
}

window.highlightLine = (lineId) => {
    routeLayerGroup.clearLayers();
    highlightLayer.clearLayers();
    routeInfoContainer.classList.add('hidden');
    drawAllLines();

    Object.keys(lineLayers).forEach(id => {
        const layers = lineLayers[id];
        layers.forEach(layer => {
            const el = layer.getElement();
            if (el) {
                if (id === lineId) {
                    el.classList.remove('line-faded');
                } else {
                    el.classList.add('line-faded');
                }
            }
        });
    });

    if (lineLayers[lineId]) {
        lineLayers[lineId].forEach(l => l.bringToFront());
    }
    markerLayerGroup.bringToFront();
};

window.cycleJourneyPopup = (direction) => {
    const { journeys, layer } = currentPopupState;
    let newIndex = currentPopupState.index + direction;
    if (newIndex >= 0 && newIndex < journeys.length) {
        currentPopupState.index = newIndex;
        const newContent = generateJourneyPopupContent();
        map.openPopup(newContent, layer.getCenter());
        highlightJourneyPath(journeys[newIndex]);
    }
};

function resetLineHighlight() {
    Object.values(lineLayers).flat().forEach(layer => {
        const el = layer.getElement();
        if (el) {
            el.classList.remove('line-faded');
        }
    });
}

function addStationMarkers() {
    markerLayerGroup.clearLayers();
    allStations.forEach(station => {
        const popupContent = createPopupContent(station);
        const marker = L.circleMarker([station.lat, station.lon], {
            radius: 5, color: '#a0aec0', weight: 1.5, fillColor: '#4a5568', fillOpacity: 1
        }).addTo(markerLayerGroup);
        marker.bindPopup(popupContent, { pane: 'popupPane' });
    });
}

// NEW: Reworked route finding algorithm to penalize line changes
function findShortestRoute(start, end) {
    const interchangePenalty = 15; // Higher value makes changing lines less desirable
    const costs = {};
    const pathToStation = {};
    
    // Initialize costs for all stations to infinity
    allStations.forEach(s => {
        costs[s.name] = Infinity;
    });

    costs[start] = 0;
    pathToStation[start] = { path: [start], line: null, cost: 0 };
    
    // Simple priority queue implementation
    const queue = [{ station: start, cost: 0 }];

    while (queue.length > 0) {
        // Sort queue to get the lowest cost station
        queue.sort((a, b) => a.cost - b.cost);
        const { station: currentStation, cost: currentCost } = queue.shift();
        
        if (currentCost > costs[currentStation]) {
            continue;
        }

        if (currentStation === end) {
            return pathToStation[end].path;
        }

        const neighbors = new Set();
        for (const lineId in linesData) {
            if (linesData[lineId].connections[currentStation]) {
                linesData[lineId].connections[currentStation].forEach(neighbor => neighbors.add(neighbor));
            }
        }

        neighbors.forEach(neighbor => {
            const lineUsed = getLineForSegment(currentStation, neighbor);
            let newCost = costs[currentStation] + 1; // Base cost for one stop

            // Check if this move is a line change and apply penalty
            const prevLine = pathToStation[currentStation].line;
            if (prevLine && lineUsed !== prevLine && prevLine !== 'interchange' && lineUsed !== 'interchange') {
                newCost += interchangePenalty;
            }

            if (newCost < costs[neighbor]) {
                costs[neighbor] = newCost;
                pathToStation[neighbor] = {
                    path: [...pathToStation[currentStation].path, neighbor],
                    line: lineUsed,
                    cost: newCost
                };
                queue.push({ station: neighbor, cost: newCost });
            }
        });
    }

    return null; // No path found
}


function displayRoute(path, container = routeInfoDiv) {
    networkLinesLayerGroup.clearLayers();
    
    if (container === routeInfoDiv) {
        routeLayerGroup.clearLayers();
        highlightLayer.clearLayers();
    }
    
    if (!path) {
        const content = `<p class="text-red-400">Sorry, a route could not be found.</p>`;
        if (container === routeInfoDiv) {
            routeInfoContainer.classList.remove('hidden');
            routeInfoDiv.innerHTML = content;
        }
        return content;
    }

    const pathCoords = path.map(name => stationsCoords[name] || allStations.find(s => s.name === name)).filter(Boolean);
    if (pathCoords.length > 1 && container === routeInfoDiv) {
        map.fitBounds(L.latLngBounds(pathCoords.map(s => [s.lat, s.lon])), { padding: [50, 50] });
    }

    let routeSegments = [];
    let currentLine = null;
    let segmentStart = path[0];
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i], to = path[i+1];
        const lineOn = getLineForSegment(from, to);
        if(lineOn !== currentLine && currentLine !== null) {
            routeSegments.push({line: currentLine, from: segmentStart, to: from });
            segmentStart = from;
        }
        currentLine = lineOn;
    }
    routeSegments.push({line: currentLine, from: segmentStart, to: path[path.length - 1] });

    let routeHtml = '<ol class="space-y-4">';
    routeSegments.forEach(segment => {
        if (segment.line === 'interchange') {
            routeHtml += `
            <li class="flex items-start">
                <div class="flex-shrink-0"><div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold text-indigo-400 ring-4 ring-gray-800">🚶</div></div>
                <div class="ml-4">
                    <p class="font-semibold text-gray-200">Walk</p>
                    <p class="text-sm text-gray-400">From <strong>${segment.from}</strong> to <strong>${segment.to}</strong></p>
                </div>
            </li>`;
            return;
        }

        const color = lineColors[segment.line] || '#808080';
        const lineName = linesData[segment.line] ? linesData[segment.line].name : 'Unknown Line';
        const segmentPath = path.slice(path.indexOf(segment.from), path.indexOf(segment.to) + 1);
        const stops = segmentPath.length - 1;
        routeHtml += `
            <li class="flex items-start">
                <div class="flex-shrink-0"><div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold text-indigo-400 ring-4 ring-gray-800"><span class="line-color-indicator" style="background-color: ${color};"></span></div></div>
                <div class="ml-4">
                    <p class="font-semibold text-gray-200">Take the ${lineName}</p>
                    <p class="text-sm text-gray-400">From <strong>${segment.from}</strong> to <strong>${segment.to}</strong></p>
                    <p class="text-xs text-gray-500">${stops} stop${stops > 1 ? 's' : ''}</p>
                </div>
            </li>`;
        
        if (container === routeInfoDiv) {
            const segmentCoords = segmentPath.map(sName => {
                const station = allStations.find(s => s.name === sName);
                return station ? [station.lat, station.lon] : null;
            }).filter(Boolean);

            if (segmentCoords.length > 1) {
                L.polyline(segmentCoords, { color: color, weight: 6, opacity: 1 }).addTo(routeLayerGroup);
            }
        }
    });
    routeHtml += '</ol>';

    if (container === routeInfoDiv) {
        routeInfoContainer.classList.remove('hidden');
        container.innerHTML = routeHtml;
    }
    return routeHtml;
}

function getLineForSegment(from, to) {
    for (const lineId in linesData) {
        if (lineId !== 'interchange' && linesData[lineId].connections[from]?.includes(to)) return lineId;
    }
    if (linesData['interchange']?.connections[from]?.includes(to)) return 'interchange';
    return null;
}

function showMessage(text, duration = 4000) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-box-text');
    if(!messageBox || !messageText) return;
    
    messageText.innerText = text;
    messageBox.classList.remove('hidden');
    messageBox.classList.add('animate-fade-in');
    
    setTimeout(() => {
        messageBox.classList.add('hidden');
        messageBox.classList.remove('animate-fade-in');
    }, duration);
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

async function processAndDrawJourneyHeatmap(files) {
    drawAllLinesAsGrey();
    routeLayerGroup.clearLayers();
    highlightLayer.clearLayers();
    routeInfoContainer.classList.add('hidden');
    journeysData = [];
    const journeysByPath = {};

    const readFile = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });

    const allFileContents = await Promise.all(Array.from(files).map(readFile));

    allFileContents.forEach(content => {
        const fileLines = content.split('\n').slice(1);
        fileLines.forEach(line => {
            const columns = parseCsvLine(line.trim());
            // FIX: TfL Journey History has the journey in the 4th column (index 3)
            if (columns.length < 4) return;
            
            const journeyString = columns[3].replace(/"/g, '');
            if (journeyString.toLowerCase().includes('bus journey')) return;

            const parts = journeyString.split(' to ');
            if (parts.length === 2) {
                const from = parts[0].replace(/\s*\[.*?\]\s*|\s*\(.*?\)\s*/g, '').trim();
                const to = parts[1].replace(/\s*\[.*?\]\s*|\s*\(.*?\)\s*/g, '').trim();
                const date = columns[0];
                const time = columns[1];
                
                if (stationsCoords[from] && stationsCoords[to] && from !== to) {
                    const journeyInfo = { from, to, date, time };
                    journeysData.push(journeyInfo);
                    const key = `${from}|${to}`;
                    if (!journeysByPath[key]) journeysByPath[key] = [];
                    journeysByPath[key].push(journeyInfo);
                }
            }
        });
    });

    if (Object.keys(journeysByPath).length === 0) {
        showMessage("No valid station-to-station journeys found in the uploaded file(s). Please check the file format.");
        drawAllLines();
        return;
    }
    
    const segmentsToJourneys = {};
    for (const [journeyKey, journeys] of Object.entries(journeysByPath)) {
        const [from, to] = journeyKey.split('|');
        const path = findShortestRoute(from, to);
        if (path) {
            journeysByPath[journeyKey].path = path;
            for (let i = 0; i < path.length - 1; i++) {
                const segmentKey = [path[i], path[i+1]].sort().join('|');
                if (!segmentsToJourneys[segmentKey]) {
                    segmentsToJourneys[segmentKey] = { journeys: new Set(), stations: [path[i], path[i+1]] };
                }
                segmentsToJourneys[segmentKey].journeys.add(journeyKey);
            }
        }
    }

    const maxCount = Math.max(...Object.values(segmentsToJourneys).map(s => s.journeys.size));

    for (const segment of Object.values(segmentsToJourneys)) {
        const [from, to] = segment.stations;
        const fromStation = allStations.find(s => s.name === from);
        const toStation = allStations.find(s => s.name === to);
        const pathCoords = [[fromStation.lat, fromStation.lon], [toStation.lat, toStation.lon]];
        const count = segment.journeys.size;
        const normalizedCount = count / maxCount;
        const style = {
            color: `hsl(0, 100%, ${85 - 50 * normalizedCount}%)`,
            opacity: 0.5 + 0.4 * normalizedCount,
            weight: 2 + 5 * normalizedCount
        };
        
        const polyline = L.polyline(pathCoords, style).addTo(highlightLayer);

        polyline.on('click', (e) => {
            const journeyKeys = Array.from(segment.journeys);
            const allJourneyDetails = journeyKeys.map(key => ({
                key,
                details: journeysByPath[key],
                path: journeysByPath[key].path
            }));

            currentPopupState = {
                journeys: allJourneyDetails,
                index: 0,
                layer: polyline
            };
            
            const popupContent = generateJourneyPopupContent();
            highlightJourneyPath(currentPopupState.journeys[0]);
            
            const popup = L.popup({ minWidth: 280, pane: 'popupPane' })
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(map);

            popup.on('remove', () => {
                highlightLayer.clearLayers();
                drawAllLines();
            });
            
            L.DomEvent.stopPropagation(e);
        });
    }
    addStationMarkers(); 
    markerLayerGroup.bringToFront();
}

function generateJourneyPopupContent() {
    const { journeys, index } = currentPopupState;
    const journey = journeys[index];
    const [from, to] = journey.key.split('|');
    const allTrips = journey.details;

    const container = document.createElement('div');
    
    let content = `<div class="text-base"><b>${from} to ${to}</b></div><hr class="my-1 border-gray-600">`;
    content += `<p class="text-xs text-gray-400">Displaying journey ${index + 1} of ${journeys.length} on this segment</p>`;
    
    const routeDetailsHtml = displayRoute(journey.path, null);
    content += `<details class="mt-2"><summary class="cursor-pointer text-sm text-indigo-400 hover:text-indigo-300">Show ${allTrips.length} Trip(s) & Route</summary><div class="mt-2 p-2 bg-gray-700 rounded">${routeDetailsHtml}</div></details>`;

    const navContainer = document.createElement('div');
    navContainer.className = 'mt-2 flex justify-between';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'journey-nav-btn';
    prevBtn.innerHTML = '&larr; Prev';
    prevBtn.disabled = index === 0;
    L.DomEvent.on(prevBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        cycleJourneyPopup(-1);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'journey-nav-btn';
    nextBtn.innerHTML = 'Next &rarr;';
    nextBtn.disabled = index === journeys.length - 1;
    L.DomEvent.on(nextBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        cycleJourneyPopup(1);
    });

    navContainer.appendChild(prevBtn);
    navContainer.appendChild(nextBtn);
    
    container.innerHTML = content;
    container.appendChild(navContainer);

    return container;
}

function highlightJourneyPath(journey) {
    highlightLayer.clearLayers();
    const path = journey.path;
    if (path) {
        const pathCoords = path.map(sName => {
            const station = allStations.find(s => s.name === sName);
            return station ? [station.lat, station.lon] : null;
        }).filter(Boolean);
        if (pathCoords.length > 1) {
            L.polyline(pathCoords, { color: '#ff00ff', weight: 7, opacity: 0.9, pane: 'highlightPane' }).addTo(highlightLayer);
        }
    }
}

function drawAllLinesAsGrey() {
    networkLinesLayerGroup.clearLayers();
    for (const lineId in linesData) {
        const line = linesData[lineId];
        if (lineId === 'interchange' || !line) continue;
        
        const drawnSegments = new Set();
        for (const from in line.connections) {
            const fromStation = allStations.find(s => s.name === from);
            if(fromStation) {
                line.connections[from].forEach(to => {
                    const toStation = allStations.find(s => s.name === to);
                    const segmentKey = [from, to].sort().join('|');

                    if(toStation && !drawnSegments.has(segmentKey)) {
                        L.polyline([[fromStation.lat, fromStation.lon], [toStation.lat, toStation.lon]], {
                            color: '#555555', 
                            weight: 2, 
                            opacity: 0.5,
                        }).addTo(networkLinesLayerGroup);
                        drawnSegments.add(segmentKey);
                    }
                });
            }
        }
    }
}

function drawAllLines() {
    networkLinesLayerGroup.clearLayers();
    lineLayers = {};

    for (const lineId in linesData) {
        const line = linesData[lineId];
        if (lineId === 'interchange' || !line) continue;
        
        lineLayers[lineId] = [];
        const color = lineColors[lineId] || '#808080';

        const drawnSegments = new Set();
        for (const from in line.connections) {
            const fromStation = allStations.find(s => s.name === from);
            if(fromStation) {
                line.connections[from].forEach(to => {
                    const toStation = allStations.find(s => s.name === to);
                    const segmentKey = [from, to].sort().join('|');

                    if(toStation && !drawnSegments.has(segmentKey)) {
                        const polyline = L.polyline([[fromStation.lat, fromStation.lon], [toStation.lat, toStation.lon]], {
                            color: color, 
                            weight: 4, 
                            opacity: 0.8,
                            className: 'leaflet-line-path'
                        }).addTo(networkLinesLayerGroup);
                        
                        // NEW: Add click event to highlight the whole line
                        polyline.on('click', (e) => {
                            L.DomEvent.stopPropagation(e);
                            window.highlightLine(lineId);
                        });

                        lineLayers[lineId].push(polyline);
                        drawnSegments.add(segmentKey);
                    }
                });
            }
        }
    }
    resetLineHighlight();
    markerLayerGroup.bringToFront();
}

// --- Event Listeners ---
findRouteBtn.addEventListener('click', () => {
    const start = startStationSelect.value;
    const end = endStationSelect.value;
    if (!start || !end) {
        showMessage("Please select both a start and end station.");
        return;
    }
    if (start === end) {
        showMessage("Start and end stations cannot be the same.");
        return;
    }
    const path = findShortestRoute(start, end);
    displayRoute(path, routeInfoDiv);
    markerLayerGroup.bringToFront();
});

csvUploadInput.addEventListener('change', () => {
    if (csvUploadInput.files.length > 0) {
        processAndDrawJourneyHeatmap(csvUploadInput.files);
    }
});

document.addEventListener('DOMContentLoaded', fetchData);
