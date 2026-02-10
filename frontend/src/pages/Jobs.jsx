import { useEffect, useState } from "react";
import {
  FiBookmark,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiEye,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import ApplyJobModal from "../components/ApplyJobModal";
import jobService from "../services/jobService";
import userService from "../services/userService";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    experience: "",
  });
  const [savedJobs, setSavedJobs] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);

  // Comprehensive worldwide locations database
  const worldwideLocations = [
    // Work Types
    "Remote",
    "Hybrid",
    "On-site",

    // North America - USA
    "New York, NY, USA",
    "Los Angeles, CA, USA",
    "Chicago, IL, USA",
    "Houston, TX, USA",
    "Phoenix, AZ, USA",
    "Philadelphia, PA, USA",
    "San Antonio, TX, USA",
    "San Diego, CA, USA",
    "Dallas, TX, USA",
    "San Jose, CA, USA",
    "Austin, TX, USA",
    "Jacksonville, FL, USA",
    "Fort Worth, TX, USA",
    "Columbus, OH, USA",
    "Charlotte, NC, USA",
    "San Francisco, CA, USA",
    "Indianapolis, IN, USA",
    "Seattle, WA, USA",
    "Denver, CO, USA",
    "Washington, DC, USA",
    "Boston, MA, USA",
    "El Paso, TX, USA",
    "Nashville, TN, USA",
    "Detroit, MI, USA",
    "Oklahoma City, OK, USA",
    "Portland, OR, USA",
    "Las Vegas, NV, USA",
    "Memphis, TN, USA",
    "Louisville, KY, USA",
    "Baltimore, MD, USA",
    "Milwaukee, WI, USA",
    "Albuquerque, NM, USA",
    "Tucson, AZ, USA",
    "Fresno, CA, USA",
    "Sacramento, CA, USA",
    "Mesa, AZ, USA",
    "Kansas City, MO, USA",
    "Atlanta, GA, USA",
    "Long Beach, CA, USA",
    "Colorado Springs, CO, USA",
    "Raleigh, NC, USA",
    "Miami, FL, USA",
    "Virginia Beach, VA, USA",
    "Omaha, NE, USA",
    "Oakland, CA, USA",
    "Minneapolis, MN, USA",
    "Tulsa, OK, USA",
    "Arlington, TX, USA",
    "Tampa, FL, USA",
    "New Orleans, LA, USA",

    // North America - Canada
    "Toronto, ON, Canada",
    "Montreal, QC, Canada",
    "Vancouver, BC, Canada",
    "Calgary, AB, Canada",
    "Edmonton, AB, Canada",
    "Ottawa, ON, Canada",
    "Winnipeg, MB, Canada",
    "Quebec City, QC, Canada",
    "Hamilton, ON, Canada",
    "Kitchener, ON, Canada",
    "London, ON, Canada",
    "Victoria, BC, Canada",
    "Halifax, NS, Canada",
    "Oshawa, ON, Canada",
    "Windsor, ON, Canada",

    // North America - Mexico
    "Mexico City, Mexico",
    "Guadalajara, Mexico",
    "Monterrey, Mexico",
    "Puebla, Mexico",
    "Tijuana, Mexico",
    "León, Mexico",
    "Juárez, Mexico",
    "Torreón, Mexico",
    "Querétaro, Mexico",
    "San Luis Potosí, Mexico",

    // Europe - United Kingdom
    "London, UK",
    "Birmingham, UK",
    "Manchester, UK",
    "Glasgow, UK",
    "Liverpool, UK",
    "Leeds, UK",
    "Sheffield, UK",
    "Edinburgh, UK",
    "Bristol, UK",
    "Cardiff, UK",
    "Leicester, UK",
    "Coventry, UK",
    "Bradford, UK",
    "Belfast, UK",
    "Nottingham, UK",
    "Plymouth, UK",
    "Stoke-on-Trent, UK",
    "Wolverhampton, UK",

    // Europe - Germany
    "Berlin, Germany",
    "Hamburg, Germany",
    "Munich, Germany",
    "Cologne, Germany",
    "Frankfurt, Germany",
    "Stuttgart, Germany",
    "Düsseldorf, Germany",
    "Dortmund, Germany",
    "Essen, Germany",
    "Leipzig, Germany",
    "Bremen, Germany",
    "Dresden, Germany",
    "Hanover, Germany",
    "Nuremberg, Germany",
    "Duisburg, Germany",

    // Europe - France
    "Paris, France",
    "Marseille, France",
    "Lyon, France",
    "Toulouse, France",
    "Nice, France",
    "Nantes, France",
    "Strasbourg, France",
    "Montpellier, France",
    "Bordeaux, France",
    "Lille, France",
    "Rennes, France",
    "Reims, France",
    "Le Havre, France",
    "Saint-Étienne, France",
    "Toulon, France",

    // Europe - Italy
    "Rome, Italy",
    "Milan, Italy",
    "Naples, Italy",
    "Turin, Italy",
    "Palermo, Italy",
    "Genoa, Italy",
    "Bologna, Italy",
    "Florence, Italy",
    "Bari, Italy",
    "Catania, Italy",
    "Venice, Italy",
    "Verona, Italy",

    // Europe - Spain
    "Madrid, Spain",
    "Barcelona, Spain",
    "Valencia, Spain",
    "Seville, Spain",
    "Zaragoza, Spain",
    "Málaga, Spain",
    "Murcia, Spain",
    "Palma, Spain",
    "Las Palmas, Spain",
    "Bilbao, Spain",

    // Europe - Netherlands
    "Amsterdam, Netherlands",
    "Rotterdam, Netherlands",
    "The Hague, Netherlands",
    "Utrecht, Netherlands",
    "Eindhoven, Netherlands",
    "Tilburg, Netherlands",
    "Groningen, Netherlands",
    "Almere, Netherlands",

    // Europe - Other Countries
    "Stockholm, Sweden",
    "Gothenburg, Sweden",
    "Malmö, Sweden",
    "Uppsala, Sweden",
    "Copenhagen, Denmark",
    "Aarhus, Denmark",
    "Odense, Denmark",
    "Aalborg, Denmark",
    "Oslo, Norway",
    "Bergen, Norway",
    "Stavanger, Norway",
    "Trondheim, Norway",
    "Helsinki, Finland",
    "Espoo, Finland",
    "Tampere, Finland",
    "Vantaa, Finland",
    "Zurich, Switzerland",
    "Geneva, Switzerland",
    "Basel, Switzerland",
    "Bern, Switzerland",
    "Vienna, Austria",
    "Graz, Austria",
    "Linz, Austria",
    "Salzburg, Austria",
    "Brussels, Belgium",
    "Antwerp, Belgium",
    "Ghent, Belgium",
    "Charleroi, Belgium",
    "Dublin, Ireland",
    "Cork, Ireland",
    "Limerick, Ireland",
    "Galway, Ireland",
    "Lisbon, Portugal",
    "Porto, Portugal",
    "Vila Nova de Gaia, Portugal",
    "Amadora, Portugal",
    "Prague, Czech Republic",
    "Brno, Czech Republic",
    "Ostrava, Czech Republic",
    "Plzen, Czech Republic",
    "Warsaw, Poland",
    "Krakow, Poland",
    "Łódź, Poland",
    "Wrocław, Poland",
    "Poznań, Poland",
    "Budapest, Hungary",
    "Debrecen, Hungary",
    "Szeged, Hungary",
    "Miskolc, Hungary",
    "Bucharest, Romania",
    "Cluj-Napoca, Romania",
    "Timișoara, Romania",
    "Iași, Romania",
    "Sofia, Bulgaria",
    "Plovdiv, Bulgaria",
    "Varna, Bulgaria",
    "Burgas, Bulgaria",
    "Athens, Greece",
    "Thessaloniki, Greece",
    "Patras, Greece",
    "Heraklion, Greece",
    "Zagreb, Croatia",
    "Split, Croatia",
    "Rijeka, Croatia",
    "Osijek, Croatia",
    "Belgrade, Serbia",
    "Novi Sad, Serbia",
    "Niš, Serbia",
    "Kragujevac, Serbia",
    "Ljubljana, Slovenia",
    "Maribor, Slovenia",
    "Celje, Slovenia",
    "Kranj, Slovenia",
    "Bratislava, Slovakia",
    "Košice, Slovakia",
    "Prešov, Slovakia",
    "Žilina, Slovakia",

    // Asia - China
    "Beijing, China",
    "Shanghai, China",
    "Guangzhou, China",
    "Shenzhen, China",
    "Tianjin, China",
    "Wuhan, China",
    "Dongguan, China",
    "Chengdu, China",
    "Nanjing, China",
    "Chongqing, China",
    "Xi'an, China",
    "Shenyang, China",
    "Hangzhou, China",
    "Jinan, China",
    "Harbin, China",

    // Asia - India
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Hyderabad, India",
    "Ahmedabad, India",
    "Chennai, India",
    "Kolkata, India",
    "Surat, India",
    "Pune, India",
    "Jaipur, India",
    "Lucknow, India",
    "Kanpur, India",
    "Nagpur, India",
    "Indore, India",
    "Thane, India",
    "Bhopal, India",
    "Visakhapatnam, India",
    "Pimpri-Chinchwad, India",
    "Patna, India",
    "Vadodara, India",

    // Asia - Japan
    "Tokyo, Japan",
    "Yokohama, Japan",
    "Osaka, Japan",
    "Nagoya, Japan",
    "Sapporo, Japan",
    "Fukuoka, Japan",
    "Kobe, Japan",
    "Kawasaki, Japan",
    "Kyoto, Japan",
    "Saitama, Japan",

    // Asia - South Korea
    "Seoul, South Korea",
    "Busan, South Korea",
    "Incheon, South Korea",
    "Daegu, South Korea",
    "Daejeon, South Korea",
    "Gwangju, South Korea",
    "Ulsan, South Korea",
    "Suwon, South Korea",

    // Asia - Southeast Asia
    "Jakarta, Indonesia",
    "Surabaya, Indonesia",
    "Bandung, Indonesia",
    "Bekasi, Indonesia",
    "Medan, Indonesia",
    "Manila, Philippines",
    "Quezon City, Philippines",
    "Caloocan, Philippines",
    "Davao, Philippines",
    "Bangkok, Thailand",
    "Nonthaburi, Thailand",
    "Nakhon Ratchasima, Thailand",
    "Chiang Mai, Thailand",
    "Ho Chi Minh City, Vietnam",
    "Hanoi, Vietnam",
    "Haiphong, Vietnam",
    "Da Nang, Vietnam",
    "Kuala Lumpur, Malaysia",
    "George Town, Malaysia",
    "Ipoh, Malaysia",
    "Shah Alam, Malaysia",
    "Singapore",
    "Yangon, Myanmar",
    "Mandalay, Myanmar",
    "Naypyidaw, Myanmar",
    "Phnom Penh, Cambodia",
    "Siem Reap, Cambodia",
    "Vientiane, Laos",
    "Savannakhet, Laos",
    "Bandar Seri Begawan, Brunei",

    // Asia - Middle East
    "Istanbul, Turkey",
    "Ankara, Turkey",
    "Izmir, Turkey",
    "Bursa, Turkey",
    "Adana, Turkey",
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Sharjah, UAE",
    "Al Ain, UAE",
    "Riyadh, Saudi Arabia",
    "Jeddah, Saudi Arabia",
    "Mecca, Saudi Arabia",
    "Medina, Saudi Arabia",
    "Kuwait City, Kuwait",
    "Hawalli, Kuwait",
    "Doha, Qatar",
    "Al Rayyan, Qatar",
    "Manama, Bahrain",
    "Riffa, Bahrain",
    "Muscat, Oman",
    "Seeb, Oman",
    "Tehran, Iran",
    "Mashhad, Iran",
    "Isfahan, Iran",
    "Karaj, Iran",
    "Baghdad, Iraq",
    "Basra, Iraq",
    "Mosul, Iraq",
    "Damascus, Syria",
    "Aleppo, Syria",
    "Homs, Syria",
    "Beirut, Lebanon",
    "Tripoli, Lebanon",
    "Amman, Jordan",
    "Zarqa, Jordan",
    "Tel Aviv, Israel",
    "Jerusalem, Israel",
    "Haifa, Israel",
    "Ramallah, Palestine",
    "Gaza, Palestine",

    // Asia - Central Asia
    "Almaty, Kazakhstan",
    "Nur-Sultan, Kazakhstan",
    "Shymkent, Kazakhstan",
    "Tashkent, Uzbekistan",
    "Samarkand, Uzbekistan",
    "Namangan, Uzbekistan",
    "Bishkek, Kyrgyzstan",
    "Osh, Kyrgyzstan",
    "Dushanbe, Tajikistan",
    "Khujand, Tajikistan",
    "Ashgabat, Turkmenistan",
    "Turkmenbashi, Turkmenistan",
    "Kabul, Afghanistan",
    "Kandahar, Afghanistan",

    // Asia - South Asia
    "Karachi, Pakistan",
    "Lahore, Pakistan",
    "Faisalabad, Pakistan",
    "Rawalpindi, Pakistan",
    "Dhaka, Bangladesh",
    "Chittagong, Bangladesh",
    "Khulna, Bangladesh",
    "Rajshahi, Bangladesh",
    "Colombo, Sri Lanka",
    "Dehiwala-Mount Lavinia, Sri Lanka",
    "Moratuwa, Sri Lanka",
    "Kathmandu, Nepal",
    "Pokhara, Nepal",
    "Lalitpur, Nepal",
    "Thimphu, Bhutan",
    "Phuntsholing, Bhutan",
    "Malé, Maldives",

    // Africa - North Africa
    "Cairo, Egypt",
    "Alexandria, Egypt",
    "Giza, Egypt",
    "Shubra El Kheima, Egypt",
    "Casablanca, Morocco",
    "Rabat, Morocco",
    "Fez, Morocco",
    "Marrakech, Morocco",
    "Algiers, Algeria",
    "Oran, Algeria",
    "Constantine, Algeria",
    "Tunis, Tunisia",
    "Sfax, Tunisia",
    "Sousse, Tunisia",
    "Tripoli, Libya",
    "Benghazi, Libya",
    "Misrata, Libya",
    "Khartoum, Sudan",
    "Omdurman, Sudan",
    "Port Sudan, Sudan",

    // Africa - West Africa
    "Lagos, Nigeria",
    "Kano, Nigeria",
    "Ibadan, Nigeria",
    "Abuja, Nigeria",
    "Port Harcourt, Nigeria",
    "Accra, Ghana",
    "Kumasi, Ghana",
    "Tamale, Ghana",
    "Abidjan, Côte d'Ivoire",
    "Bouaké, Côte d'Ivoire",
    "Dakar, Senegal",
    "Touba, Senegal",
    "Bamako, Mali",
    "Sikasso, Mali",
    "Ouagadougou, Burkina Faso",
    "Bobo-Dioulasso, Burkina Faso",
    "Conakry, Guinea",
    "Nzérékoré, Guinea",
    "Freetown, Sierra Leone",
    "Bo, Sierra Leone",
    "Monrovia, Liberia",
    "Gbarnga, Liberia",

    // Africa - East Africa
    "Nairobi, Kenya",
    "Mombasa, Kenya",
    "Nakuru, Kenya",
    "Eldoret, Kenya",
    "Dar es Salaam, Tanzania",
    "Mwanza, Tanzania",
    "Arusha, Tanzania",
    "Kampala, Uganda",
    "Gulu, Uganda",
    "Lira, Uganda",
    "Kigali, Rwanda",
    "Butare, Rwanda",
    "Bujumbura, Burundi",
    "Gitega, Burundi",
    "Addis Ababa, Ethiopia",
    "Dire Dawa, Ethiopia",
    "Mekelle, Ethiopia",
    "Mogadishu, Somalia",
    "Hargeisa, Somalia",
    "Djibouti, Djibouti",
    "Asmara, Eritrea",
    "Keren, Eritrea",

    // Africa - Southern Africa
    "Johannesburg, South Africa",
    "Cape Town, South Africa",
    "Durban, South Africa",
    "Pretoria, South Africa",
    "Port Elizabeth, South Africa",
    "Pietermaritzburg, South Africa",
    "Benoni, South Africa",
    "Harare, Zimbabwe",
    "Bulawayo, Zimbabwe",
    "Chitungwiza, Zimbabwe",
    "Lusaka, Zambia",
    "Kitwe, Zambia",
    "Ndola, Zambia",
    "Gaborone, Botswana",
    "Francistown, Botswana",
    "Windhoek, Namibia",
    "Rundu, Namibia",
    "Maseru, Lesotho",
    "Teyateyaneng, Lesotho",
    "Mbabane, Eswatini",
    "Manzini, Eswatini",
    "Antananarivo, Madagascar",
    "Toamasina, Madagascar",
    "Port Louis, Mauritius",
    "Beau Bassin-Rose Hill, Mauritius",

    // Africa - Central Africa
    "Kinshasa, DR Congo",
    "Lubumbashi, DR Congo",
    "Mbuji-Mayi, DR Congo",
    "Brazzaville, Republic of Congo",
    "Pointe-Noire, Republic of Congo",
    "Yaoundé, Cameroon",
    "Douala, Cameroon",
    "Garoua, Cameroon",
    "Bangui, Central African Republic",
    "N'Djamena, Chad",
    "Moundou, Chad",
    "Malabo, Equatorial Guinea",
    "Bata, Equatorial Guinea",
    "Libreville, Gabon",
    "Port-Gentil, Gabon",
    "São Tomé, São Tomé and Príncipe",

    // Oceania - Australia
    "Sydney, Australia",
    "Melbourne, Australia",
    "Brisbane, Australia",
    "Perth, Australia",
    "Adelaide, Australia",
    "Gold Coast, Australia",
    "Newcastle, Australia",
    "Canberra, Australia",
    "Sunshine Coast, Australia",
    "Wollongong, Australia",
    "Hobart, Australia",
    "Geelong, Australia",
    "Townsville, Australia",
    "Cairns, Australia",
    "Darwin, Australia",
    "Toowoomba, Australia",

    // Oceania - New Zealand
    "Auckland, New Zealand",
    "Wellington, New Zealand",
    "Christchurch, New Zealand",
    "Hamilton, New Zealand",
    "Tauranga, New Zealand",
    "Napier-Hastings, New Zealand",
    "Dunedin, New Zealand",
    "Palmerston North, New Zealand",

    // Oceania - Pacific Islands
    "Suva, Fiji",
    "Nadi, Fiji",
    "Port Moresby, Papua New Guinea",
    "Lae, Papua New Guinea",
    "Honiara, Solomon Islands",
    "Port Vila, Vanuatu",
    "Nuku'alofa, Tonga",
    "Apia, Samoa",
    "Tarawa, Kiribati",
    "Majuro, Marshall Islands",
    "Palikir, Micronesia",
    "Ngerulmud, Palau",
    "Funafuti, Tuvalu",
    "Yaren, Nauru",

    // South America
    "São Paulo, Brazil",
    "Rio de Janeiro, Brazil",
    "Brasília, Brazil",
    "Salvador, Brazil",
    "Fortaleza, Brazil",
    "Belo Horizonte, Brazil",
    "Manaus, Brazil",
    "Curitiba, Brazil",
    "Recife, Brazil",
    "Porto Alegre, Brazil",
    "Belém, Brazil",
    "Goiânia, Brazil",
    "Buenos Aires, Argentina",
    "Córdoba, Argentina",
    "Rosario, Argentina",
    "Mendoza, Argentina",
    "La Plata, Argentina",
    "San Miguel de Tucumán, Argentina",
    "Mar del Plata, Argentina",
    "Santiago, Chile",
    "Valparaíso, Chile",
    "Concepción, Chile",
    "La Serena, Chile",
    "Antofagasta, Chile",
    "Temuco, Chile",
    "Rancagua, Chile",
    "Lima, Peru",
    "Arequipa, Peru",
    "Trujillo, Peru",
    "Chiclayo, Peru",
    "Huancayo, Peru",
    "Bogotá, Colombia",
    "Medellín, Colombia",
    "Cali, Colombia",
    "Barranquilla, Colombia",
    "Cartagena, Colombia",
    "Cúcuta, Colombia",
    "Bucaramanga, Colombia",
    "Caracas, Venezuela",
    "Maracaibo, Venezuela",
    "Valencia, Venezuela",
    "Barquisimeto, Venezuela",
    "Quito, Ecuador",
    "Guayaquil, Ecuador",
    "Cuenca, Ecuador",
    "Santo Domingo, Ecuador",
    "La Paz, Bolivia",
    "Santa Cruz, Bolivia",
    "Cochabamba, Bolivia",
    "Sucre, Bolivia",
    "Asunción, Paraguay",
    "Ciudad del Este, Paraguay",
    "San Lorenzo, Paraguay",
    "Montevideo, Uruguay",
    "Salto, Uruguay",
    "Paysandú, Uruguay",
    "Georgetown, Guyana",
    "Linden, Guyana",
    "Paramaribo, Suriname",
    "Lelydorp, Suriname",
    "Cayenne, French Guiana",
    "Saint-Laurent-du-Maroni, French Guiana",

    // Central America & Caribbean
    "Guatemala City, Guatemala",
    "Mixco, Guatemala",
    "Villa Nueva, Guatemala",
    "Belize City, Belize",
    "San Ignacio, Belize",
    "San Salvador, El Salvador",
    "Soyapango, El Salvador",
    "Santa Ana, El Salvador",
    "Tegucigalpa, Honduras",
    "San Pedro Sula, Honduras",
    "Choloma, Honduras",
    "Managua, Nicaragua",
    "León, Nicaragua",
    "Masaya, Nicaragua",
    "San José, Costa Rica",
    "Cartago, Costa Rica",
    "Puntarenas, Costa Rica",
    "Panama City, Panama",
    "San Miguelito, Panama",
    "Tocumen, Panama",
    "Havana, Cuba",
    "Santiago de Cuba, Cuba",
    "Camagüey, Cuba",
    "Santo Domingo, Dominican Republic",
    "Santiago, Dominican Republic",
    "La Romana, Dominican Republic",
    "Port-au-Prince, Haiti",
    "Cap-Haïtien, Haiti",
    "Delmas, Haiti",
    "Kingston, Jamaica",
    "Spanish Town, Jamaica",
    "Portmore, Jamaica",
    "San Juan, Puerto Rico",
    "Bayamón, Puerto Rico",
    "Carolina, Puerto Rico",
    "Port of Spain, Trinidad and Tobago",
    "Chaguanas, Trinidad and Tobago",
    "Bridgetown, Barbados",
    "Speightstown, Barbados",
    "St. George's, Grenada",
    "Gouyave, Grenada",
    "Castries, Saint Lucia",
    "Bisée, Saint Lucia",
    "Kingstown, Saint Vincent and the Grenadines",
    "St. John's, Antigua and Barbuda",
    "Roseau, Dominica",
    "Basseterre, Saint Kitts and Nevis",
    "Nassau, Bahamas",
    "Lucaya, Bahamas",
  ];

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAllJobs(filters);
      if (response.status === "success") {
        const jobsData = response.data.map((job) => ({
          id: job.id || job._id,
          title: job.title,
          company: job.company || "Company",
          location: job.location,
          salary:
            job.salaryMin && job.salaryMax
              ? `$${job.salaryMin}k-$${job.salaryMax}k`
              : "Competitive",
          type: job.type,
          experience: job.experience,
          posted: new Date(job.createdAt).toLocaleDateString(),
          dueDate: job.applicationDeadline
            ? new Date(job.applicationDeadline).toLocaleDateString()
            : null,
          daysLeft: job.applicationDeadline
            ? Math.ceil(
                (new Date(job.applicationDeadline) - new Date()) /
                  (1000 * 60 * 60 * 24),
              )
            : null,
          description: job.description,
          skills: job.skills || [],
          requirements: job.requirements,
          benefits: job.benefits,
        }));
        setJobs(jobsData);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await userService.getSavedJobs();
      if (response.status === "success") {
        setSavedJobs(response.data.map((job) => job.id || job._id));
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!user) {
      alert("Please login to save jobs");
      return;
    }

    try {
      const isSaved = savedJobs.includes(jobId);
      if (isSaved) {
        await userService.unsaveJob(jobId);
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
      } else {
        await userService.saveJob(jobId);
        setSavedJobs((prev) => [...prev, jobId]);
      }
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job");
    }
  };

  const handleApplyJob = (job) => {
    if (!user) {
      alert("Please login to apply for jobs");
      return;
    }
    setJobToApply(job);
    setApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    if (jobToApply?.id) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobToApply.id ? { ...j, applied: true } : j)),
      );
    }
    setJobToApply(null);
    alert("Application submitted successfully!");
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationSearch = (value) => {
    setFilters((prev) => ({ ...prev, location: value }));

    if (value.length > 0) {
      const suggestions = worldwideLocations
        .filter((location) =>
          location.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 10); // Show max 10 suggestions
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setFilters((prev) => ({ ...prev, location }));
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".location-search")) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    return (
      (!filters.search ||
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.location ||
        job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.type || job.type === filters.type) &&
      (!filters.experience || job.experience === filters.experience)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Your Dream Job
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover opportunities that match your skills and interests
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative location-search">
              <input
                type="text"
                placeholder="Location (e.g., Remote, New York, London)"
                value={filters.location}
                onChange={(e) => handleLocationSearch(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(location)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange("experience", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Experience</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredJobs.length} jobs found
            </p>
            <button
              onClick={fetchJobs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {job.company}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiMapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <FiClock className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <FiDollarSign className="h-4 w-4 mr-1" />
                      {job.salary}
                    </div>
                  </div>
                  {job.dueDate && (
                    <div
                      className={`mt-2 text-sm ${
                        job.daysLeft <= 3
                          ? "text-red-600 font-medium"
                          : job.daysLeft <= 7
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}
                    >
                      📅 Apply by: {job.dueDate} ({job.daysLeft} days left)
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {user && (
                    <button
                      onClick={() => handleSaveJob(job.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        savedJobs.includes(job.id)
                          ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900"
                          : "text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <FiBookmark className="h-4 w-4" />
                    </button>
                  )}
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{job.posted}</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{job.skills.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleApplyJob(job)}
                  disabled={job.daysLeft <= 0}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                    job.daysLeft <= 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {job.daysLeft <= 0 ? "Application Closed" : "Apply Now"}
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm">
                  <FiEye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <FiBriefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Jobs Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or check back later for new
              opportunities.
            </p>
          </div>
        )}
      </div>

      <ApplyJobModal
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        job={jobToApply}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
};

export default Jobs;
