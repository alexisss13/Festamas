export const PERU_DEPARTMENTS = [
  "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca",
  "Callao", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín",
  "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios",
  "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna",
  "Tumbes", "Ucayali"
];


export const PERU_PROVINCES: Record<string, string[]> = {
  "Amazonas": ["Chachapoyas", "Bagua", "Bongará", "Condorcanqui", "Luya", "Rodríguez de Mendoza", "Utcubamba"],

  "Áncash": ["Huaraz", "Aija", "Antonio Raymondi", "Asunción", "Bolognesi", "Carhuaz", "Casma", "Corongo",
    "Huari", "Huarmey", "Huaylas", "Mariscal Luzuriaga", "Ocros", "Pallasca",
    "Pomabamba", "Recuay", "Santa", "Sihuas", "Yungay"],

  "Apurímac": ["Abancay", "Andahuaylas", "Antabamba", "Aymaraes", "Cotabambas", "Chincheros", "Grau"],

  "Arequipa": ["Arequipa", "Camaná", "Caravelí", "Castilla", "Caylloma", "Condesuyos", "Islay", "La Unión"],

  "Ayacucho": ["Huamanga", "Cangallo", "Huanca Sancos", "Huanta", "La Mar", "Lucanas",
    "Parinacochas", "Páucar del Sara Sara", "Sucre", "Víctor Fajardo", "Vilcas Huamán"],

  "Cajamarca": ["Cajamarca", "Cajabamba", "Celendín", "Chota", "Contumazá", "Cutervo",
    "Hualgayoc", "Jaén", "San Ignacio", "San Marcos", "San Miguel",
    "San Pablo", "Santa Cruz"],

  "Callao": ["Callao"],

  "Cusco": ["Cusco", "Acomayo", "Anta", "Calca", "Canas", "Canchis", "Chumbivilcas",
    "Espinar", "La Convención", "Paruro", "Paucartambo", "Quispicanchi", "Urubamba"],

  "Huancavelica": ["Huancavelica", "Acobamba", "Angaraes", "Castrovirreyna",
    "Churcampa", "Huaytará", "Tayacaja"],

  "Huánuco": ["Huánuco", "Ambo", "Dos de Mayo", "Huacaybamba", "Huamalíes",
    "Leoncio Prado", "Marañón", "Pachitea", "Puerto Inca", "Lauricocha", "Yarowilca"],

  "Ica": ["Ica", "Chincha", "Nazca", "Palpa", "Pisco"],

  "Junín": ["Huancayo", "Chanchamayo", "Concepción", "Jauja", "Junín",
    "Satipo", "Tarma", "Yauli", "Chupaca"],

  "La Libertad": ["Trujillo", "Ascope", "Bolívar", "Chepén", "Gran Chimú",
    "Julcán", "Otuzco", "Pacasmayo", "Pataz", "Sánchez Carrión", "Santiago de Chuco", "Virú"],

  "Lambayeque": ["Chiclayo", "Ferreñafe", "Lambayeque"],

  "Lima": ["Lima", "Barranca", "Cajatambo", "Canta", "Cañete", "Huaral",
    "Huarochirí", "Huaura", "Oyón", "Yauyos"],

  "Loreto": ["Maynas", "Alto Amazonas", "Datem del Marañón", "Loreto", "Mariscal Ramón Castilla",
    "Putumayo", "Requena", "Ucayali"],

  "Madre de Dios": ["Tambopata", "Manu", "Tahuamanu"],

  "Moquegua": ["Mariscal Nieto", "General Sánchez Cerro", "Ilo"],

  "Pasco": ["Pasco", "Daniel Alcides Carrión", "Oxapampa"],

  "Piura": ["Piura", "Ayabaca", "Huancabamba", "Morropón", "Paita", "Sechura", "Sullana", "Talara"],

  "Puno": ["Puno", "Azángaro", "Carabaya", "Chucuito", "El Collao", "Huancané",
    "Lampa", "Melgar", "Moho", "San Antonio de Putina", "San Román",
    "Sandia", "Yunguyo"],

  "San Martín": ["Moyobamba", "Bellavista", "El Dorado", "Huallaga", "Lamas",
    "Mariscal Cáceres", "Picota", "Rioja", "San Martín", "Tocache"],

  "Tacna": ["Tacna", "Candarave", "Jorge Basadre", "Tarata"],

  "Tumbes": ["Tumbes", "Contralmirante Villar", "Zarumilla"],

  "Ucayali": ["Coronel Portillo", "Atalaya", "Padre Abad", "Purús"]
};


export const PERU_DISTRICTS: Record<string, string[]> = {
  // AMAZONAS
  "Chachapoyas": ["Chachapoyas"],
  "Bagua": ["Bagua", "Bagua Grande"],
  "Bongará": ["Jumbilla"],
  "Condorcanqui": ["Nieva"],
  "Luya": ["Lamud"],
  "Rodríguez de Mendoza": ["San Nicolás"],
  "Utcubamba": ["Bagua Grande"],

  // ÁNCASH
  "Huaraz": ["Huaraz"],
  "Santa": ["Chimbote", "Nuevo Chimbote"],
  "Casma": ["Casma"],
  "Huarmey": ["Huarmey"],
  "Huaylas": ["Caraz"],
  "Yungay": ["Yungay"],
  "Carhuaz": ["Carhuaz"],
  "Huari": ["Huari"],
  "Bolognesi": ["Chiquián"],
  "Pallasca": ["Cabana"],

  // AREQUIPA
  "Arequipa": ["Arequipa"],
  "Camaná": ["Camaná"],
  "Caravelí": ["Caravelí"],
  "Caylloma": ["Chivay"],
  "Islay": ["Mollendo"],

  // AYACUCHO
  "Huamanga": ["Ayacucho"],
  "Huanta": ["Huanta"],
  "La Mar": ["San Miguel"],
  "Lucanas": ["Puquio"],
  "Parinacochas": ["Coracora"],
  "Víctor Fajardo": ["Huancapi"],
  "Vilcas Huamán": ["Vilcas Huamán"],

  // CAJAMARCA
  "Cajamarca": ["Cajamarca"],
  "Jaén": ["Jaén"],
  "Cutervo": ["Cutervo"],
  "Chota": ["Chota"],
  "Celendín": ["Celendín"],
  "San Ignacio": ["San Ignacio"],
  "San Marcos": ["Pedro Gálvez"],

  // CALLAO
  "Callao": ["Callao"],

  // CUSCO
  "Cusco": ["Cusco"],
  "Anta": ["Anta"],
  "Calca": ["Calca"],
  "Urubamba": ["Urubamba"],
  "La Convención": ["Quillabamba"],

  // HUANCAVELICA
  "Huancavelica": ["Huancavelica"],
  "Tayacaja": ["Pampas"],
  "Angaraes": ["Lircay"],

  // HUÁNUCO
  "Huánuco": ["Huánuco"],
  "Leoncio Prado": ["Tingo María"],
  "Ambo": ["Ambo"],

  // ICA
  "Ica": ["Ica"],
  "Chincha": ["Chincha Alta"],
  "Pisco": ["Pisco"],
  "Nazca": ["Nazca"],

  // JUNÍN
  "Huancayo": ["Huancayo", "El Tambo"],
  "Chanchamayo": ["La Merced"],
  "Satipo": ["Satipo"],
  "Tarma": ["Tarma"],

  // LA LIBERTAD
  "Trujillo": ["Trujillo"],
  "Ascope": ["Ascope"],
  "Chepén": ["Chepén"],
  "Pacasmayo": ["Pacasmayo"],
  "Virú": ["Virú"],
  "Otuzco": ["Otuzco"],

  // LAMBAYEQUE
  "Chiclayo": ["Chiclayo"],
  "Ferreñafe": ["Ferreñafe"],
  "Lambayeque": ["Lambayeque"],

  // LIMA
  "Lima": [
    "Lima", "Miraflores", "San Isidro", "Surco",
    "San Borja", "La Molina", "Los Olivos",
    "San Juan de Lurigancho", "Villa El Salvador"
  ],
  "Barranca": ["Barranca"],
  "Cañete": ["San Vicente de Cañete"],
  "Huaral": ["Huaral"],
  "Huaura": ["Huacho"],

  // LORETO
  "Maynas": ["Iquitos"],
  "Alto Amazonas": ["Yurimaguas"],
  "Requena": ["Requena"],

  // MADRE DE DIOS
  "Tambopata": ["Puerto Maldonado"],

  // MOQUEGUA
  "Mariscal Nieto": ["Moquegua"],
  "Ilo": ["Ilo"],

  // PASCO
  "Pasco": ["Cerro de Pasco"],
  "Oxapampa": ["Oxapampa"],

  // PIURA
  "Piura": ["Piura"],
  "Sullana": ["Sullana"],
  "Talara": ["Talara"],
  "Paita": ["Paita"],
  "Sechura": ["Sechura"],

  // PUNO
  "Puno": ["Puno"],
  "San Román": ["Juliaca"],

  // SAN MARTÍN
  "Moyobamba": ["Moyobamba"],
  "San Martín": ["Tarapoto"],
  "Bellavista": ["Bellavista"],

  // TACNA
  "Tacna": ["Tacna"],

  // TUMBES
  "Tumbes": ["Tumbes"],

  // UCAYALI
  "Coronel Portillo": ["Pucallpa"]
};



export const getProvinces = (department: string) => {
  return PERU_PROVINCES[department] || ["Cercado"];
};

export const getDistricts = (province: string) => {
  return PERU_DISTRICTS[province] || [province + " (Distrito)"];
};