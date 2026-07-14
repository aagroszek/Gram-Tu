import { useState, useMemo, useRef, useEffect } from "react"
import {
  MapPin, MessageCircle, Bell, User, Home, Users,
  ChevronLeft, Search, X, Send, ExternalLink,
  Map, Globe, LogIn, UserPlus, LogOut, Filter,
  CheckCircle, Plus, Minus, ChevronRight, Edit2, Trash2,
  Camera, Link, FileText, Mail, Shield, Award
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "pl" | "en"
type View = "home" | "venues" | "venue-detail" | "map" | "users" | "messages" | "profile" | "profile-edit"
type Section = "gram-tu" | "trenuje-tu"
type ActivityType = "tennis" | "basketball" | "football" | "fitness" | "outdoor" | "swimming" | "hiking" | "climbing" | "walking" | "running" | "other"
type VenueType = "tennis-court" | "basketball-court" | "football-pitch" | "outdoor-training" | "fitness-center" | "swimming-pool" | "hiking-trail" | "climbing-wall" | "running-track" | "other"
type Level = "beginner" | "intermediate" | "high-intermediate" | "advanced" | "pro"

interface UserActivity { activity: ActivityType; level?: Level }
interface AppUser {
  id: string; username: string; city: string; avatar: string
  bio: string; email: string; activities: UserActivity[]
  languages?: string[]; isCoach?: boolean
}
interface VenueEntry { userId: string; activity: ActivityType; level?: Level }
interface Venue {
  id: string; namePl: string; nameEn: string; type: VenueType
  section: Section; lat: number; lng: number; address: string
  website?: string; initialUsers: VenueEntry[]
  addedBy: string; imageUrl?: string; bioPl?: string; bioEn?: string
}
interface Message { id: string; fromId: string; toId: string; text: string; timestamp: Date }
interface AppNotification {
  id: string; type: "message" | "new-venue"
  textPl: string; textEn: string; read: boolean; timestamp: Date
  venueId?: string; fromUserId?: string
}
interface Comment {
  id: string; venueId: string; userId: string; text: string; timestamp: Date
  replies: Reply[]
}
interface Reply { id: string; commentId: string; userId: string; text: string; timestamp: Date }

// ─── Translations ─────────────────────────────────────────────────────────────

const T = {
  pl: {
    appName: "Gram Tu",
    tagline: "Znajdź ludzi do gry i treningu w Krakowie",
    gramTu: "Gram Tu",
    trenujeTu: "Trenuje Tu",
    iPlayHere: "Gram tu!",
    iTrainHere: "Trenuje tu!",
    removeMe: "Usuń mnie",
    home: "Główna",
    map: "Mapa",
    users: "Gracze",
    messages: "Wiadomości",
    profile: "Profil",
    login: "Zaloguj",
    register: "Zarejestruj",
    logout: "Wyloguj",
    search: "Szukaj...",
    send: "Wyślij",
    message: "Wiadomość",
    level: "Poziom",
    activity: "Aktywność",
    city: "Miasto",
    venue: "Obiekt",
    allLevels: "Wszystkie poziomy",
    allActivities: "Wszystkie aktywności",
    allCities: "Wszystkie miasta",
    allVenues: "Wszystkie obiekty",
    usersAt: "graczy",
    website: "Strona www",
    back: "Wróć",
    notifications: "Powiadomienia",
    noNotifications: "Brak powiadomień",
    noMessages: "Brak wiadomości. Napisz coś!",
    noConversations: "Brak rozmów",
    selectConversation: "Wybierz rozmowę",
    writeMessage: "Napisz wiadomość...",
    joinPrompt: "Dołącz i pokaż, że tu grasz lub trenujesz!",
    addYourselfCTA: "Czy tu grasz lub trenujesz? Dodaj siebie!",
    chooseActivity: "Wybierz aktywność",
    chooseLevel: "Wybierz poziom",
    confirm: "Potwierdź",
    cancel: "Anuluj",
    loginRequired: "Zaloguj się, aby dołączyć lub wysłać wiadomość",
    yourProfile: "Twój profil",
    yourVenues: "Twoje obiekty",
    noVenues: "Nie jesteś jeszcze na żadnej liście",
    username: "Nazwa użytkownika",
    email: "E-mail",
    bio: "Bio",
    cityLabel: "Miasto",
    activities: "Aktywności",
    registerTitle: "Utwórz konto",
    loginTitle: "Zaloguj się",
    demoLogin: "Zaloguj jako Demo_User",
    featuredVenues: "Polecane obiekty",
    allPlayers: "Wszyscy gracze",
    filterBy: "Filtruj",
    addVenue: "Dodaj obiekt",
    addVenueTitle: "Dodaj nowy obiekt",
    venueNamePl: "Nazwa (Polski)",
    venueNameEn: "Nazwa (Angielski)",
    venueType: "Typ obiektu",
    section: "Sekcja",
    address: "Adres",
    imageUrl: "URL zdjęcia (opcjonalnie)",
    venueBio: "Opis obiektu (opcjonalnie)",
    addedByAdmin: "Dodany przez",
    admin: "admin",
    comments: "Komentarze",
    addComment: "Dodaj komentarz...",
    reply: "Odpowiedź",
    addReply: "Napisz odpowiedź...",
    noComments: "Brak komentarzy. Bądź pierwszy!",
    editProfile: "Edytuj profil",
    deleteProfile: "Usuń konto",
    deleteProfileConfirm: "Czy na pewno chcesz usunąć konto? Tej operacji nie można cofnąć.",
    deleteVenue: "Usuń obiekt",
    editVenue: "Edytuj obiekt",
    languages: "Języki",
    selectLanguages: "Wybierz języki",
    coachBadge: "Jestem trenerem / instruktorem",
    privacy: "Ochrona danych",
    privacyText: "Nie udostępniamy Twoich danych żadnym stronom trzecim. Twój e-mail jest prywatny.",
    privacyAgree: "Zapoznałem/am się z polityką prywatności i wyrażam zgodę na przetwarzanie moich danych.",
    verifyEmail: "Sprawdź swoją skrzynkę e-mail i kliknij link weryfikacyjny, aby aktywować konto.",
    verifyEmailTitle: "Zweryfikuj adres e-mail",
    save: "Zapisz",
    coach: "Trener",
    speaksLabel: "Mówi:",
    noLevel: "—",
    levels: {
      beginner: "Początkujący",
      intermediate: "Średniozaawansowany",
      "high-intermediate": "Dobry",
      advanced: "Zaawansowany",
      pro: "Profesjonalny",
    },
    acts: {
      tennis: "Tenis",
      basketball: "Koszykówka",
      football: "Piłka nożna",
      fitness: "Siłownia",
      outdoor: "Trening plenerowy",
      swimming: "Pływanie",
      hiking: "Wędrówki",
      climbing: "Wspinaczka",
      walking: "Chodzenie / Spacery",
      running: "Bieganie",
      other: "Inne",
    },
    venueTypes: {
      "tennis-court": "Kort tenisowy",
      "basketball-court": "Boisko do kosza",
      "football-pitch": "Boisko piłkarskie",
      "outdoor-training": "Siłownia plenerowa",
      "fitness-center": "Centrum fitness",
      "swimming-pool": "Basen / Pływalnia",
      "hiking-trail": "Szlak turystyczny",
      "climbing-wall": "Ścianka wspinaczkowa",
      "running-track": "Bieżnia / Trasa",
      other: "Inny obiekt",
    },
    sections: { "gram-tu": "Gram Tu", "trenuje-tu": "Trenuje Tu" },
    langOptions: ["Polski", "Angielski", "Niemiecki", "Francuski", "Hiszpański", "Ukraiński", "Włoski", "Rosyjski", "Inny"],
  },
  en: {
    appName: "Gram Tu",
    tagline: "Find people to play and train with in Kraków",
    gramTu: "I Play Here",
    trenujeTu: "I Train Here",
    iPlayHere: "I Play Here!",
    iTrainHere: "I Train Here!",
    removeMe: "Remove me",
    home: "Home",
    map: "Map",
    users: "Players",
    messages: "Messages",
    profile: "Profile",
    login: "Log In",
    register: "Register",
    logout: "Log Out",
    search: "Search...",
    send: "Send",
    message: "Message",
    level: "Level",
    activity: "Activity",
    city: "City",
    venue: "Venue",
    allLevels: "All levels",
    allActivities: "All activities",
    allCities: "All cities",
    allVenues: "All venues",
    usersAt: "players",
    website: "Website",
    back: "Back",
    notifications: "Notifications",
    noNotifications: "No notifications",
    noMessages: "No messages yet. Say hello!",
    noConversations: "No conversations",
    selectConversation: "Select a conversation",
    writeMessage: "Write a message...",
    joinPrompt: "Join the list and show you play or train here!",
    addYourselfCTA: "Do you play or train here? Add yourself!",
    chooseActivity: "Choose activity",
    chooseLevel: "Choose level",
    confirm: "Confirm",
    cancel: "Cancel",
    loginRequired: "Log in to join a venue or send a message",
    yourProfile: "Your profile",
    yourVenues: "Your venues",
    noVenues: "You haven't joined any venue yet",
    username: "Username",
    email: "Email",
    bio: "Bio",
    cityLabel: "City",
    activities: "Activities",
    registerTitle: "Create account",
    loginTitle: "Log in",
    demoLogin: "Log in as Demo_User",
    featuredVenues: "Featured venues",
    allPlayers: "All players",
    filterBy: "Filter",
    addVenue: "Add venue",
    addVenueTitle: "Add new venue",
    venueNamePl: "Name (Polish)",
    venueNameEn: "Name (English)",
    venueType: "Venue type",
    section: "Section",
    address: "Address",
    imageUrl: "Image URL (optional)",
    venueBio: "Venue description (optional)",
    addedByAdmin: "Added by",
    admin: "admin",
    comments: "Comments",
    addComment: "Add a comment...",
    reply: "Reply",
    addReply: "Write a reply...",
    noComments: "No comments yet. Be the first!",
    editProfile: "Edit profile",
    deleteProfile: "Delete account",
    deleteProfileConfirm: "Are you sure you want to delete your account? This cannot be undone.",
    deleteVenue: "Delete venue",
    editVenue: "Edit venue",
    languages: "Languages",
    selectLanguages: "Select languages",
    coachBadge: "I am a coach / instructor",
    privacy: "Privacy",
    privacyText: "We will not share your data with any third parties. Your email is private.",
    privacyAgree: "I have read the privacy policy and consent to my data being processed.",
    verifyEmail: "Please check your email inbox and click the verification link to activate your account.",
    verifyEmailTitle: "Verify your email",
    save: "Save",
    coach: "Coach",
    speaksLabel: "Speaks:",
    noLevel: "—",
    levels: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      "high-intermediate": "High Intermediate",
      advanced: "Advanced",
      pro: "Professional",
    },
    acts: {
      tennis: "Tennis",
      basketball: "Basketball",
      football: "Football",
      fitness: "Gym / Fitness",
      outdoor: "Outdoor Training",
      swimming: "Swimming",
      hiking: "Hiking",
      climbing: "Climbing",
      walking: "Walking",
      running: "Running",
      other: "Other",
    },
    venueTypes: {
      "tennis-court": "Tennis Court",
      "basketball-court": "Basketball Court",
      "football-pitch": "Football Pitch",
      "outdoor-training": "Outdoor Gym",
      "fitness-center": "Fitness Centre",
      "swimming-pool": "Swimming Pool",
      "hiking-trail": "Hiking Trail",
      "climbing-wall": "Climbing Wall",
      "running-track": "Running Track",
      other: "Other venue",
    },
    sections: { "gram-tu": "I Play Here", "trenuje-tu": "I Train Here" },
    langOptions: ["Polish", "English", "German", "French", "Spanish", "Ukrainian", "Italian", "Russian", "Other"],
  },
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const DEMO_USER: AppUser = {
  id: "current",
  username: "Demo_User",
  city: "Kraków",
  avatar: "https://i.pravatar.cc/150?img=3",
  bio: "Nowy w Krakowie, szukam ludzi do gry! | New to Kraków, looking for people to play with!",
  email: "demo@gramtu.pl",
  activities: [{ activity: "tennis", level: "intermediate" }],
  languages: ["Polish", "English"],
  isCoach: false,
}

const USERS: AppUser[] = [
  { id: "u1", username: "Marek_W", city: "Kraków", avatar: "https://i.pravatar.cc/150?img=11", bio: "Tenisista od 10 lat. Szukam partnerów do gry.", email: "marek@example.com", activities: [{ activity: "tennis", level: "advanced" }], languages: ["Polish", "English"], isCoach: false },
  { id: "u2", username: "Zofia_K", city: "Kraków", avatar: "https://i.pravatar.cc/150?img=47", bio: "Gram w piłkę od dziecka. Lubię grać w weekendy.", email: "zofia@example.com", activities: [{ activity: "football", level: "intermediate" }, { activity: "fitness", level: "beginner" }], languages: ["Polish"], isCoach: false },
  { id: "u3", username: "Piotr_N", city: "Kraków", avatar: "https://i.pravatar.cc/150?img=52", bio: "Basketball is life. Looking for pickup games in Kraków.", email: "piotr@example.com", activities: [{ activity: "basketball", level: "pro" }], languages: ["Polish", "English"], isCoach: true },
  { id: "u4", username: "Anna_L", city: "Kraków", avatar: "https://i.pravatar.cc/150?img=32", bio: "Zaczęłam przygodę z siłownią rok temu. Motywacja kluczem!", email: "anna@example.com", activities: [{ activity: "fitness", level: "beginner" }, { activity: "outdoor", level: "beginner" }], languages: ["Polish", "Ukrainian"], isCoach: false },
  { id: "u5", username: "Tomasz_B", city: "Kraków", avatar: "https://i.pravatar.cc/150?img=60", bio: "Tenis, bieganie, rower. Aktywny przez cały rok.", email: "tomasz@example.com", activities: [{ activity: "tennis", level: "high-intermediate" }, { activity: "running", level: "intermediate" }], languages: ["Polish", "German"], isCoach: false },
  { id: "u6", username: "Katarzyna_M", city: "Kraków", avatar: "https://i.pravatar.cc/150?img=44", bio: "Trening funkcjonalny i kalistenika. Ćwiczę na powietrzu.", email: "kasia@example.com", activities: [{ activity: "outdoor", level: "advanced" }, { activity: "climbing", level: "intermediate" }], languages: ["Polish", "English", "French"], isCoach: true },
  { id: "u7", username: "Rafał_S", city: "Kraków", avatar: "https://i.pravatar.cc/150?img=68", bio: "Piłka nożna 3x w tygodniu. Szukam drużyny.", email: "rafal@example.com", activities: [{ activity: "football", level: "advanced" }], languages: ["Polish"], isCoach: false },
  { id: "u8", username: "Ewa_P", city: "Kraków", avatar: "https://i.pravatar.cc/150?img=26", bio: "CrossFit i bieganie. Always up for a challenge!", email: "ewa@example.com", activities: [{ activity: "fitness", level: "intermediate" }, { activity: "running", level: "intermediate" }], languages: ["Polish", "English"], isCoach: false },
]

const VENUES_DATA: Venue[] = [
  { id: "v1", namePl: "Korty Tenisowe Oleandry", nameEn: "Oleandry Tennis Courts", type: "tennis-court", section: "gram-tu", lat: 50.0621, lng: 19.9261, address: "al. 3 Maja 5, Kraków", website: "https://www.korty-oleandry.pl", initialUsers: [{ userId: "u1", activity: "tennis", level: "advanced" }, { userId: "u5", activity: "tennis", level: "high-intermediate" }], addedBy: "admin", imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=300&fit=crop&auto=format", bioPl: "Kompleks kortów w parku Błonia. Nawierzchnia ceglana, 8 kortów, oświetlenie.", bioEn: "Tennis complex by Błonia park. Clay surface, 8 courts with lighting." },
  { id: "v2", namePl: "Korty Tenisowe AZS", nameEn: "AZS Kraków Tennis Club", type: "tennis-court", section: "gram-tu", lat: 50.0672, lng: 19.9019, address: "ul. Lea 10, Kraków", website: "https://www.azs.krakow.pl", initialUsers: [{ userId: "u1", activity: "tennis", level: "advanced" }], addedBy: "admin", bioPl: "Klub uczelniany z kortami ceglanymi i twardymi.", bioEn: "University club with clay and hard courts." },
  { id: "v3", namePl: "Boisko Orliki Grzegórzki", nameEn: "Grzegórzki Basketball Court", type: "basketball-court", section: "gram-tu", lat: 50.0756, lng: 19.9378, address: "ul. Grzegórzecka 44, Kraków", initialUsers: [{ userId: "u3", activity: "basketball", level: "pro" }], addedBy: "admin", bioPl: "Otwarte boisko do koszykówki, dostęp bezpłatny.", bioEn: "Open basketball court, free access." },
  { id: "v4", namePl: "Boisko do kosza Krowodrza", nameEn: "Krowodrza Basketball Court", type: "basketball-court", section: "gram-tu", lat: 50.0712, lng: 19.9145, address: "ul. Królewska 86, Kraków", initialUsers: [{ userId: "u3", activity: "basketball", level: "pro" }], addedBy: "admin" },
  { id: "v5", namePl: "Boisko Hutnik Kraków", nameEn: "Hutnik Kraków Football Pitch", type: "football-pitch", section: "gram-tu", lat: 50.0834, lng: 19.9234, address: "ul. Łokietka 31, Kraków", website: "https://www.hutnik.krakow.pl", initialUsers: [{ userId: "u2", activity: "football", level: "intermediate" }, { userId: "u7", activity: "football", level: "advanced" }], addedBy: "admin", imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=300&fit=crop&auto=format", bioPl: "Profesjonalne boisko trawiaste klubu Hutnik.", bioEn: "Professional grass pitch of Hutnik FC." },
  { id: "v6", namePl: "Boisko Podgórze Park", nameEn: "Podgórze Park Football Pitch", type: "football-pitch", section: "gram-tu", lat: 50.0412, lng: 19.9701, address: "ul. Zamenhoffa 2, Podgórze, Kraków", initialUsers: [{ userId: "u7", activity: "football", level: "advanced" }], addedBy: "admin" },
  { id: "v7", namePl: "Siłownia Plenerowa Błonia", nameEn: "Błonia Outdoor Gym", type: "outdoor-training", section: "trenuje-tu", lat: 50.0621, lng: 19.9178, address: "Błonia, Kraków", initialUsers: [{ userId: "u4", activity: "outdoor", level: "beginner" }, { userId: "u6", activity: "outdoor", level: "advanced" }], addedBy: "admin", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=300&fit=crop&auto=format", bioPl: "Darmowa siłownia na świeżym powietrzu w parku Błonia.", bioEn: "Free outdoor gym in Błonia park." },
  { id: "v8", namePl: "Park Jordana — Siłownia plenerowa", nameEn: "Jordan Park Outdoor Gym", type: "outdoor-training", section: "trenuje-tu", lat: 50.0627, lng: 19.9101, address: "Park Jordana, al. 3 Maja, Kraków", initialUsers: [{ userId: "u5", activity: "outdoor", level: "advanced" }, { userId: "u8", activity: "outdoor", level: "intermediate" }], addedBy: "admin" },
  { id: "v9", namePl: "Zakrzówek — Strefa Ćwiczeń", nameEn: "Zakrzówek Training Zone", type: "outdoor-training", section: "trenuje-tu", lat: 50.0378, lng: 19.9023, address: "ul. Zakrzówek, Kraków", initialUsers: [{ userId: "u6", activity: "outdoor", level: "advanced" }], addedBy: "admin" },
  { id: "v10", namePl: "Gym One Kazimierz", nameEn: "Gym One Kazimierz", type: "fitness-center", section: "trenuje-tu", lat: 50.0514, lng: 19.9423, address: "ul. Dietla 60, Kazimierz, Kraków", website: "https://www.gymone.pl", initialUsers: [{ userId: "u4", activity: "fitness", level: "beginner" }, { userId: "u8", activity: "fitness", level: "intermediate" }], addedBy: "admin", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=300&fit=crop&auto=format", bioPl: "Nowoczesne centrum fitness w sercu Kazimierza.", bioEn: "Modern fitness centre in the heart of Kazimierz." },
  { id: "v11", namePl: "FitFabric Kraków", nameEn: "FitFabric Kraków", type: "fitness-center", section: "trenuje-tu", lat: 50.0678, lng: 19.9556, address: "ul. Mogilska 65, Kraków", website: "https://www.fitfabric.pl", initialUsers: [{ userId: "u6", activity: "fitness", level: "intermediate" }], addedBy: "admin" },
  { id: "v12", namePl: "McFit Galeria Krakowska", nameEn: "McFit Galeria Krakowska", type: "fitness-center", section: "trenuje-tu", lat: 50.0634, lng: 19.9456, address: "ul. Pawia 5, Kraków", website: "https://www.mcfit.com/pl", initialUsers: [{ userId: "u2", activity: "fitness", level: "beginner" }], addedBy: "admin" },
  { id: "v13", namePl: "Pływalnia Clepardii", nameEn: "Clepardia Swimming Pool", type: "swimming-pool", section: "trenuje-tu", lat: 50.0756, lng: 19.9289, address: "ul. Mackiewicza 14, Kraków", website: "https://www.mck-krakow.pl", initialUsers: [], addedBy: "admin", bioPl: "Kryty basen olimpijski z 8 torami i niecką dla dzieci.", bioEn: "Indoor Olympic pool with 8 lanes and a children's pool." },
  { id: "v14", namePl: "Bieżnia Park Lotników Polskich", nameEn: "Polish Aviators Park Running Track", type: "running-track", section: "trenuje-tu", lat: 50.0589, lng: 19.9823, address: "Park Lotników Polskich, Kraków", initialUsers: [{ userId: "u5", activity: "running", level: "intermediate" }, { userId: "u8", activity: "running", level: "intermediate" }], addedBy: "admin", bioPl: "400m tartanowa bieżnia z oświetleniem. Wstęp wolny.", bioEn: "400m tartan track with lighting, free entry." },
  { id: "v15", namePl: "Ścianka Wspinaczkowa Walltopia", nameEn: "Walltopia Climbing Wall", type: "climbing-wall", section: "trenuje-tu", lat: 50.0645, lng: 19.9512, address: "ul. Ślusarska 9, Kraków", website: "https://www.walltopia.pl", initialUsers: [{ userId: "u6", activity: "climbing", level: "intermediate" }], addedBy: "admin", bioPl: "Duża ścianka wspinaczkowa z 200+ drogami różnych trudności.", bioEn: "Large climbing wall with 200+ routes of varying difficulty." },
]

const INITIAL_MESSAGES: Message[] = [
  { id: "m1", fromId: "u1", toId: "current", text: "Hej! Widziałem że grasz w tenisa. Chętnie zagramy razem na Oleandry?", timestamp: new Date(Date.now() - 3600000 * 2) },
  { id: "m2", fromId: "current", toId: "u1", text: "Jasne, chętnie! Kiedy masz czas?", timestamp: new Date(Date.now() - 3600000) },
  { id: "m3", fromId: "u1", toId: "current", text: "W sobotę rano ok godz. 10? 🎾", timestamp: new Date(Date.now() - 1800000) },
  { id: "m4", fromId: "u3", toId: "current", text: "Hey! Are you up for basketball this weekend?", timestamp: new Date(Date.now() - 7200000) },
]

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "message", textPl: "Marek_W wysłał Ci wiadomość", textEn: "Marek_W sent you a message", read: false, timestamp: new Date(Date.now() - 1800000), fromUserId: "u1" },
  { id: "n2", type: "new-venue", textPl: "Nowy kort tenisowy dodany: Korty AZS", textEn: "New tennis court added: AZS Courts", read: false, timestamp: new Date(Date.now() - 86400000), venueId: "v2" },
  { id: "n3", type: "message", textPl: "Piotr_N wysłał Ci wiadomość", textEn: "Piotr_N sent you a message", read: true, timestamp: new Date(Date.now() - 7200000), fromUserId: "u3" },
]

const INITIAL_COMMENTS: Comment[] = [
  { id: "c1", venueId: "v1", userId: "u5", text: "Świetne korty, polecam! Nawierzchnia w dobrym stanie.", timestamp: new Date(Date.now() - 86400000 * 2), replies: [{ id: "r1", commentId: "c1", userId: "u1", text: "Zgadzam się, gram tu co tydzień.", timestamp: new Date(Date.now() - 86400000) }] },
  { id: "c2", venueId: "v5", userId: "u7", text: "Boisko w dobrej kondycji, polecam treningi wieczorami.", timestamp: new Date(Date.now() - 86400000 * 3), replies: [] },
  { id: "c3", venueId: "v7", userId: "u4", text: "Idealne miejsce dla początkujących! Sprzęt jest w porządku.", timestamp: new Date(Date.now() - 86400000 * 4), replies: [{ id: "r2", commentId: "c3", userId: "u6", text: "Tak, i widoki piękne przy treningu!", timestamp: new Date(Date.now() - 86400000 * 3) }] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function venueIcon(type: VenueType): string {
  return { "tennis-court": "🎾", "basketball-court": "🏀", "football-pitch": "⚽", "outdoor-training": "🏋️", "fitness-center": "💪", "swimming-pool": "🏊", "hiking-trail": "🥾", "climbing-wall": "🧗", "running-track": "🏃", other: "📍" }[type] ?? "📍"
}

function activityIcon(activity: ActivityType): string {
  return { tennis: "🎾", basketball: "🏀", football: "⚽", fitness: "💪", outdoor: "🏋️", swimming: "🏊", hiking: "🥾", climbing: "🧗", walking: "🚶", running: "🏃", other: "⭐" }[activity] ?? "⭐"
}

function levelColor(level?: Level): string {
  if (!level) return "bg-gray-100 text-gray-600"
  return { beginner: "bg-slate-100 text-slate-700", intermediate: "bg-blue-100 text-blue-700", "high-intermediate": "bg-cyan-100 text-cyan-700", advanced: "bg-orange-100 text-orange-700", pro: "bg-red-100 text-red-700" }[level]
}

function activityBg(activity: ActivityType): string {
  return { tennis: "bg-green-100 text-green-800", basketball: "bg-orange-100 text-orange-800", football: "bg-emerald-100 text-emerald-800", fitness: "bg-purple-100 text-purple-800", outdoor: "bg-yellow-100 text-yellow-800", swimming: "bg-blue-100 text-blue-800", hiking: "bg-lime-100 text-lime-800", climbing: "bg-rose-100 text-rose-800", walking: "bg-teal-100 text-teal-800", running: "bg-amber-100 text-amber-800", other: "bg-gray-100 text-gray-700" }[activity] ?? "bg-gray-100 text-gray-700"
}

function sectionColor(section: Section) {
  return section === "gram-tu"
    ? { bg: "bg-primary", text: "text-primary-foreground", light: "bg-green-50", border: "border-green-200", accent: "text-primary" }
    : { bg: "bg-accent", text: "text-accent-foreground", light: "bg-orange-50", border: "border-orange-200", accent: "text-accent" }
}

function timeAgo(date: Date, lang: Lang): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diff < 1) return lang === "pl" ? "teraz" : "now"
  if (diff < 60) return lang === "pl" ? `${diff} min temu` : `${diff}m ago`
  const h = Math.floor(diff / 60)
  if (h < 24) return lang === "pl" ? `${h} godz. temu` : `${h}h ago`
  const d = Math.floor(h / 24)
  return lang === "pl" ? `${d} dni temu` : `${d}d ago`
}

function getUserById(id: string, users: AppUser[], currentUser: AppUser | null): AppUser | undefined {
  if (id === "current" && currentUser) return currentUser
  if (id === "current") return DEMO_USER
  return users.find(u => u.id === id) ?? (currentUser?.id === id ? currentUser : undefined)
}

// ─── Small Components ─────────────────────────────────────────────────────────

function LevelBadge({ level, lang }: { level?: Level; lang: Lang }) {
  if (!level) return null
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelColor(level)}`}>{T[lang].levels[level]}</span>
}

function AddedByLine({ addedBy, users, currentUser, lang }: { addedBy: string; users: AppUser[]; currentUser: AppUser | null; lang: Lang }) {
  const t = T[lang]
  if (addedBy === "admin") {
    return (
      <span className="text-xs text-muted-foreground">
        {t.addedByAdmin}{" "}
        <a href="mailto:hello@gram-tu.com" className="text-primary hover:underline font-semibold">{t.admin}</a>
      </span>
    )
  }
  const user = getUserById(addedBy, users, currentUser)
  return <span className="text-xs text-muted-foreground">{t.addedByAdmin} <span className="font-semibold text-foreground">{user?.username ?? "—"}</span></span>
}

function VenueCard({ venue, userCount, onClick, lang, users, currentUser }: {
  venue: Venue; userCount: number; onClick: () => void; lang: Lang; users: AppUser[]; currentUser: AppUser | null
}) {
  const colors = sectionColor(venue.section)
  const name = lang === "pl" ? venue.namePl : venue.nameEn
  return (
    <button onClick={onClick} className="w-full text-left bg-card rounded-2xl border border-border hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group overflow-hidden">
      {venue.imageUrl && <div className="w-full h-28 bg-muted overflow-hidden"><img src={venue.imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl ${colors.light} flex items-center justify-center text-xl flex-shrink-0`}>{venueIcon(venue.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">{name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" /><span className="truncate">{venue.address}</span></div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.light} ${colors.accent}`}>{T[lang].venueTypes[venue.type]}</span>
              <span className="text-xs text-muted-foreground font-semibold">{userCount} {T[lang].usersAt}</span>
            </div>
            <div className="mt-2"><AddedByLine addedBy={venue.addedBy} users={users} currentUser={currentUser} lang={lang} /></div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
        </div>
      </div>
    </button>
  )
}

function MiniMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const bbox = `${lng - 0.006},${lat - 0.004},${lng + 0.006},${lat + 0.004}`
  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ height: 220 }}>
      <iframe className="w-full h-full" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`} title={name} loading="lazy" style={{ border: 0 }} />
      <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-lg border border-border hover:bg-white transition-colors">
        <ExternalLink className="w-3 h-3 inline mr-1" />OSM
      </a>
    </div>
  )
}

// ─── Home View ────────────────────────────────────────────────────────────────

function HomeView({ lang, setView, setSection, venueUsers, currentUser, allVenues, allUsers, onSelectVenue }: {
  lang: Lang; setView: (v: View) => void; setSection: (s: Section) => void
  venueUsers: Record<string, VenueEntry[]>; currentUser: AppUser | null
  allVenues: Venue[]; allUsers: AppUser[]; onSelectVenue: (v: Venue) => void
}) {
  const t = T[lang]
  const featured = allVenues.slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Hero - no overflow-hidden on outer so cards below are not clipped */}
      <div className="relative bg-primary px-5 pt-8 pb-16">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-white" />
          <div className="absolute -bottom-6 left-12 w-32 h-32 rounded-full bg-white" />
          <div className="absolute top-12 right-32 w-8 h-8 rounded-full bg-white" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="font-bold text-4xl text-white mb-2" style={{ fontFamily: "Righteous, sans-serif" }}>Gram Tu 🏆</div>
          <p className="text-green-100 text-base font-medium leading-relaxed">{t.tagline}</p>
        </div>
      </div>

      {/* Section Cards — appear above the hero bottom, not clipped */}
      <div className="relative z-10 -mt-8 px-4">
        <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
          <button onClick={() => { setSection("gram-tu"); setView("venues") }}
            className="bg-card rounded-2xl p-4 shadow-lg border border-border text-left hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0">
            <div className="text-3xl mb-2">⚽</div>
            <div className="font-bold text-primary text-sm" style={{ fontFamily: "Righteous, sans-serif" }}>{t.gramTu}</div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{lang === "pl" ? "Korty, boiska, orliki" : "Courts, pitches, parks"}</div>
          </button>
          <button onClick={() => { setSection("trenuje-tu"); setView("venues") }}
            className="bg-card rounded-2xl p-4 shadow-lg border border-border text-left hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0">
            <div className="text-3xl mb-2">💪</div>
            <div className="font-bold text-accent text-sm" style={{ fontFamily: "Righteous, sans-serif" }}>{t.trenujeTu}</div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{lang === "pl" ? "Siłownie, parki, centra" : "Gyms, parks, centres"}</div>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4 max-w-xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: allVenues.length, label: lang === "pl" ? "obiektów" : "venues" },
            { num: allUsers.length, label: lang === "pl" ? "graczy" : "players" },
            { num: Object.values(venueUsers).reduce((s, arr) => s + arr.length, 0), label: lang === "pl" ? "wpisów" : "listings" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl p-3 border border-border text-center">
              <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "Righteous, sans-serif" }}>{s.num}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Venues */}
      <div className="px-4 mt-5 max-w-xl mx-auto w-full pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground" style={{ fontFamily: "Righteous, sans-serif" }}>{t.featuredVenues}</h2>
          <button onClick={() => setView("map")} className="text-xs text-primary font-semibold flex items-center gap-1"><Map className="w-3 h-3" /> {t.map}</button>
        </div>
        <div className="flex flex-col gap-3">
          {featured.map(v => <VenueCard key={v.id} venue={v} userCount={venueUsers[v.id]?.length ?? 0} lang={lang} onClick={() => onSelectVenue(v)} users={allUsers} currentUser={currentUser} />)}
        </div>
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-2">📍</div>
          <p className="font-bold text-primary text-sm mb-1">{t.addYourselfCTA}</p>
          <p className="text-xs text-muted-foreground mb-3">{lang === "pl" ? "Znajdź swoje miejsce i dodaj się do listy graczy." : "Find your spot and add yourself to the players list."}</p>
          <button onClick={() => setView("venues")} className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
            {lang === "pl" ? "Przeglądaj obiekty" : "Browse venues"}
          </button>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          {lang === "pl" ? "Pytania? Napisz do nas:" : "Questions? Contact:"}{" "}
          <a href="mailto:hello@gram-tu.com" className="text-primary font-semibold hover:underline">hello@gram-tu.com</a>
        </div>
      </div>
    </div>
  )
}

// ─── Venues View ──────────────────────────────────────────────────────────────

function VenuesView({ lang, section, setSection, venueUsers, onSelectVenue, currentUser, allVenues, allUsers, onAddVenue }: {
  lang: Lang; section: Section; setSection: (s: Section) => void
  venueUsers: Record<string, VenueEntry[]>; onSelectVenue: (v: Venue) => void
  currentUser: AppUser | null; allVenues: Venue[]; allUsers: AppUser[]
  onAddVenue: () => void
}) {
  const t = T[lang]
  const [search, setSearch] = useState("")
  const venues = allVenues.filter(v =>
    v.section === section &&
    (search === "" || (lang === "pl" ? v.namePl : v.nameEn).toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex border-b border-border bg-card sticky top-[57px] z-10">
        {(["gram-tu", "trenuje-tu"] as Section[]).map(s => {
          const active = s === section
          return (
            <button key={s} onClick={() => setSection(s)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${active ? s === "gram-tu" ? "border-primary text-primary" : "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {s === "gram-tu" ? "⚽" : "💪"} {s === "gram-tu" ? t.gramTu : t.trenujeTu}
            </button>
          )
        })}
      </div>
      <div className="p-4 max-w-xl mx-auto w-full">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          {currentUser && (
            <button onClick={onAddVenue} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addVenue}</span>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 pb-6">
          {venues.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-3">{section === "gram-tu" ? "⚽" : "💪"}</div>
              <p className="font-medium">{lang === "pl" ? "Brak wyników" : "No results"}</p>
            </div>
          )}
          {venues.map(v => <VenueCard key={v.id} venue={v} userCount={venueUsers[v.id]?.length ?? 0} lang={lang} onClick={() => onSelectVenue(v)} users={allUsers} currentUser={currentUser} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Venue Detail View ────────────────────────────────────────────────────────

function VenueDetailView({ venue, lang, currentUser, venueUsers, setVenueUsers, onMessage, onBack, onLoginRequired, allUsers, comments, setComments, onDeleteVenue }: {
  venue: Venue; lang: Lang; currentUser: AppUser | null
  venueUsers: Record<string, VenueEntry[]>
  setVenueUsers: React.Dispatch<React.SetStateAction<Record<string, VenueEntry[]>>>
  onMessage: (u: AppUser) => void; onBack: () => void; onLoginRequired: () => void
  allUsers: AppUser[]; comments: Comment[]
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
  onDeleteVenue: (id: string) => void
}) {
  const t = T[lang]
  const name = lang === "pl" ? venue.namePl : venue.nameEn
  const colors = sectionColor(venue.section)
  const entries = venueUsers[venue.id] ?? []
  const isUserHere = currentUser ? entries.some(e => e.userId === currentUser.id) : false
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [joinActivity, setJoinActivity] = useState<ActivityType>("tennis")
  const [joinLevel, setJoinLevel] = useState<Level>("intermediate")
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [showReplyFor, setShowReplyFor] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const venueComments = comments.filter(c => c.venueId === venue.id)
  const bio = lang === "pl" ? venue.bioPl : venue.bioEn
  const isCreator = currentUser && venue.addedBy === currentUser.id
  const allActivityOptions: ActivityType[] = ["tennis", "basketball", "football", "fitness", "outdoor", "swimming", "hiking", "climbing", "walking", "running", "other"]

  function handleJoin() {
    if (!currentUser) { onLoginRequired(); return }
    if (isUserHere) {
      setVenueUsers(prev => ({ ...prev, [venue.id]: (prev[venue.id] ?? []).filter(e => e.userId !== currentUser.id) }))
    } else setShowJoinForm(true)
  }

  function confirmJoin() {
    if (!currentUser) return
    setVenueUsers(prev => ({ ...prev, [venue.id]: [...(prev[venue.id] ?? []), { userId: currentUser.id, activity: joinActivity, level: joinActivity === "other" ? undefined : joinLevel }] }))
    setShowJoinForm(false)
  }

  function addComment() {
    if (!currentUser || !commentText.trim()) return
    const c: Comment = { id: `c${Date.now()}`, venueId: venue.id, userId: currentUser.id, text: commentText.trim(), timestamp: new Date(), replies: [] }
    setComments(prev => [...prev, c])
    setCommentText("")
  }

  function addReply(commentId: string) {
    if (!currentUser || !replyText[commentId]?.trim()) return
    const r: Reply = { id: `r${Date.now()}`, commentId, userId: currentUser.id, text: replyText[commentId].trim(), timestamp: new Date() }
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: [...c.replies, r] } : c))
    setReplyText(prev => ({ ...prev, [commentId]: "" }))
    setShowReplyFor(null)
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className={`${colors.bg} ${colors.text} px-4 pt-4 pb-6 relative`}>
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-2 right-6 w-20 h-20 rounded-full bg-white" />
          <div className="absolute -bottom-4 left-8 w-24 h-24 rounded-full bg-white" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity"><ChevronLeft className="w-4 h-4" /> {t.back}</button>
            {isCreator && (
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
          <div className="flex items-start gap-3">
            <div className="text-3xl">{venueIcon(venue.type)}</div>
            <div>
              <h1 className="text-xl font-bold leading-tight" style={{ fontFamily: "Righteous, sans-serif" }}>{name}</h1>
              <div className="flex items-center gap-1 text-sm opacity-80 mt-1"><MapPin className="w-3.5 h-3.5" />{venue.address}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 max-w-xl mx-auto w-full">
        {/* Delete confirm */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold text-red-700 mb-3">{t.deleteVenue} — {lang === "pl" ? "Czy na pewno?" : "Are you sure?"}</p>
            <div className="flex gap-2">
              <button onClick={() => { onDeleteVenue(venue.id); onBack() }} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold">{t.deleteVenue}</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl border border-border text-sm font-bold">{t.cancel}</button>
            </div>
          </div>
        )}

        {/* Stats + Actions */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm mb-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold" style={{ fontFamily: "Righteous, sans-serif" }}>{entries.length}</div>
            <div className="text-xs text-muted-foreground">{t.usersAt}</div>
            <div className="mt-1"><AddedByLine addedBy={venue.addedBy} users={allUsers} currentUser={currentUser} lang={lang} /></div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {venue.website && (
              <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />{t.website}
              </a>
            )}
            <button onClick={handleJoin} className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${isUserHere ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : `${colors.bg} ${colors.text} hover:opacity-90`}`}>
              {isUserHere ? <><Minus className="w-3.5 h-3.5" /> {t.removeMe}</> : <><Plus className="w-3.5 h-3.5" /> {venue.section === "gram-tu" ? t.iPlayHere : t.iTrainHere}</>}
            </button>
          </div>
        </div>

        {/* CTA for not logged in */}
        {!currentUser && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-primary">{t.addYourselfCTA}</p>
              <p className="text-xs text-muted-foreground">{t.joinPrompt}</p>
            </div>
            <button onClick={onLoginRequired} className="bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0">{t.login}</button>
          </div>
        )}

        {/* Join Form */}
        {showJoinForm && (
          <div className="bg-card rounded-2xl border border-border p-4 mb-4 shadow-sm">
            <div className="font-bold text-sm mb-3">{t.chooseActivity}</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {allActivityOptions.map(a => (
                <button key={a} onClick={() => setJoinActivity(a)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${joinActivity === a ? `${colors.bg} ${colors.text} border-transparent` : "border-border hover:border-primary"}`}>
                  {activityIcon(a)} {T[lang].acts[a]}
                </button>
              ))}
            </div>
            {joinActivity !== "other" && (
              <>
                <div className="font-bold text-sm mb-2">{t.chooseLevel}</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(["beginner", "intermediate", "high-intermediate", "advanced", "pro"] as Level[]).map(l => (
                    <button key={l} onClick={() => setJoinLevel(l)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${joinLevel === l ? `${colors.bg} ${colors.text} border-transparent` : "border-border hover:border-primary"}`}>
                      {T[lang].levels[l]}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="flex gap-2">
              <button onClick={confirmJoin} className={`flex-1 py-2 rounded-xl text-sm font-bold ${colors.bg} ${colors.text}`}><CheckCircle className="w-4 h-4 inline mr-1" />{t.confirm}</button>
              <button onClick={() => setShowJoinForm(false)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-border hover:bg-muted transition-colors">{t.cancel}</button>
            </div>
          </div>
        )}

        {/* Image */}
        {venue.imageUrl && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-border"><img src={venue.imageUrl} alt={name} className="w-full h-48 object-cover" /></div>
        )}

        {/* Bio */}
        {bio && (
          <div className="bg-muted rounded-2xl p-4 mb-4 text-sm text-foreground leading-relaxed"><FileText className="w-4 h-4 inline mr-1.5 text-muted-foreground" />{bio}</div>
        )}

        {/* Map */}
        <div className="mb-4"><MiniMap lat={venue.lat} lng={venue.lng} name={name} /></div>

        {/* Users list */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-border font-bold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />{entries.length} {t.usersAt}
          </div>
          {entries.length === 0 && (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2">👋</div>
              <p className="text-sm text-muted-foreground">{t.joinPrompt}</p>
            </div>
          )}
          <div className="divide-y divide-border">
            {entries.map(entry => {
              const user = getUserById(entry.userId, allUsers, currentUser)
              if (!user) return null
              return (
                <div key={entry.userId} className="px-4 py-3 flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                    {user.isCoach && <span className="absolute -bottom-1 -right-1 text-sm" title="Coach">🏅</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm flex items-center gap-1">
                      {user.username}
                      {user.isCoach && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-full">{t.coach}</span>}
                    </div>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {entry.level && <LevelBadge level={entry.level} lang={lang} />}
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${activityBg(entry.activity)}`}>{activityIcon(entry.activity)} {T[lang].acts[entry.activity]}</span>
                    </div>
                  </div>
                  {currentUser?.id !== user.id && (
                    <button onClick={() => onMessage(user)} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex-shrink-0">
                      <MessageCircle className="w-3.5 h-3.5" />{lang === "pl" ? "Napisz" : "Message"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border font-bold text-sm flex items-center gap-2">
            💬 {t.comments} ({venueComments.length})
          </div>
          {venueComments.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">{t.noComments}</div>
          )}
          <div className="divide-y divide-border">
            {venueComments.map(c => {
              const commenter = getUserById(c.userId, allUsers, currentUser)
              return (
                <div key={c.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <img src={commenter?.avatar ?? ""} alt={commenter?.username ?? ""} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{commenter?.username}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(c.timestamp, lang)}</span>
                      </div>
                      <p className="text-sm text-foreground">{c.text}</p>
                      <button onClick={() => setShowReplyFor(showReplyFor === c.id ? null : c.id)} className="text-xs text-primary font-semibold mt-1.5 hover:underline">{t.reply}</button>
                      {showReplyFor === c.id && currentUser && (
                        <div className="flex gap-2 mt-2">
                          <input value={replyText[c.id] ?? ""} onChange={e => setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))} placeholder={t.addReply} className="flex-1 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" onKeyDown={e => e.key === "Enter" && addReply(c.id)} />
                          <button onClick={() => addReply(c.id)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold"><Send className="w-3 h-3" /></button>
                        </div>
                      )}
                      {c.replies.length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-border flex flex-col gap-2">
                          {c.replies.map(r => {
                            const replier = getUserById(r.userId, allUsers, currentUser)
                            return (
                              <div key={r.id} className="flex items-start gap-2">
                                <img src={replier?.avatar ?? ""} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                <div>
                                  <span className="font-bold text-xs">{replier?.username}</span>
                                  <span className="text-xs text-muted-foreground ml-1">{timeAgo(r.timestamp, lang)}</span>
                                  <p className="text-xs text-foreground">{r.text}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {currentUser ? (
            <div className="px-4 py-3 border-t border-border flex gap-2">
              <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={t.addComment} className="flex-1 px-3 py-1.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" onKeyDown={e => e.key === "Enter" && addComment()} />
              <button onClick={addComment} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold"><Send className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-border">
              <button onClick={onLoginRequired} className="text-xs text-primary font-semibold hover:underline">{lang === "pl" ? "Zaloguj się, aby dodać komentarz" : "Log in to comment"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Map View ─────────────────────────────────────────────────────────────────

function MapView({ lang, venueUsers, onSelectVenue, allVenues, allUsers, currentUser }: {
  lang: Lang; venueUsers: Record<string, VenueEntry[]>; onSelectVenue: (v: Venue) => void
  allVenues: Venue[]; allUsers: AppUser[]; currentUser: AppUser | null
}) {
  const t = T[lang]
  const [filter, setFilter] = useState<VenueType | "all">("all")
  const filtered = filter === "all" ? allVenues : allVenues.filter(v => v.type === filter)

  const typeFilters: { type: VenueType | "all"; icon: string; label: string }[] = [
    { type: "all", icon: "🗺️", label: lang === "pl" ? "Wszystkie" : "All" },
    { type: "tennis-court", icon: "🎾", label: lang === "pl" ? "Tenis" : "Tennis" },
    { type: "basketball-court", icon: "🏀", label: lang === "pl" ? "Koszykówka" : "Basketball" },
    { type: "football-pitch", icon: "⚽", label: lang === "pl" ? "Piłka" : "Football" },
    { type: "outdoor-training", icon: "🏋️", label: lang === "pl" ? "Plener" : "Outdoor" },
    { type: "fitness-center", icon: "💪", label: lang === "pl" ? "Siłownia" : "Gym" },
    { type: "swimming-pool", icon: "🏊", label: lang === "pl" ? "Basen" : "Pool" },
    { type: "running-track", icon: "🏃", label: lang === "pl" ? "Bieganie" : "Running" },
    { type: "climbing-wall", icon: "🧗", label: lang === "pl" ? "Wspinaczka" : "Climbing" },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-card border-b border-border px-3 py-2.5 overflow-x-auto sticky top-[57px] z-10">
        <div className="flex gap-2 w-max">
          {typeFilters.map(f => (
            <button key={f.type} onClick={() => setFilter(f.type)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${filter === f.type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden border border-border flex-shrink-0" style={{ height: 300 }}>
        <iframe className="w-full h-full" src="https://www.openstreetmap.org/export/embed.html?bbox=19.8500%2C49.9850%2C20.0500%2C50.1200&layer=mapnik" title="Mapa Krakowa" loading="lazy" style={{ border: 0 }} />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-bold text-foreground border border-border shadow-sm">📍 Kraków</div>
      </div>
      <div className="px-4 mt-4 pb-6 max-w-xl mx-auto w-full">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{filtered.length} {lang === "pl" ? "obiektów" : "venues"}</h2>
        <div className="flex flex-col gap-3">
          {filtered.map(v => <VenueCard key={v.id} venue={v} userCount={venueUsers[v.id]?.length ?? 0} lang={lang} onClick={() => onSelectVenue(v)} users={allUsers} currentUser={currentUser} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Users View ───────────────────────────────────────────────────────────────

function UsersView({ lang, currentUser, venueUsers, onMessage, allUsers, allVenues }: {
  lang: Lang; currentUser: AppUser | null
  venueUsers: Record<string, VenueEntry[]>; onMessage: (u: AppUser) => void
  allUsers: AppUser[]; allVenues: Venue[]
}) {
  const t = T[lang]
  const [filterLevel, setFilterLevel] = useState<Level | "all">("all")
  const [filterActivity, setFilterActivity] = useState<ActivityType | "all">("all")
  const [filterVenue, setFilterVenue] = useState<string>("all")
  const [filterCoach, setFilterCoach] = useState(false)
  const [search, setSearch] = useState("")

  const venueUserMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    allVenues.forEach(v => {
      ;(venueUsers[v.id] ?? []).forEach(e => {
        if (!map[e.userId]) map[e.userId] = []
        map[e.userId].push(v.id)
      })
    })
    return map
  }, [venueUsers, allVenues])

  const filtered = allUsers.filter(u => {
    if (search && !u.username.toLowerCase().includes(search.toLowerCase())) return false
    if (filterLevel !== "all" && !u.activities.some(a => a.level === filterLevel)) return false
    if (filterActivity !== "all" && !u.activities.some(a => a.activity === filterActivity)) return false
    if (filterVenue !== "all" && !(venueUserMap[u.id] ?? []).includes(filterVenue)) return false
    if (filterCoach && !u.isCoach) return false
    return true
  })

  const allActivityTypes: ActivityType[] = ["tennis", "basketball", "football", "fitness", "outdoor", "swimming", "hiking", "climbing", "walking", "running", "other"]

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 pt-4 pb-1 max-w-xl mx-auto w-full">
        <h1 className="font-bold text-lg mb-3" style={{ fontFamily: "Righteous, sans-serif" }}>{t.allPlayers} 👥</h1>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={filterActivity} onChange={e => setFilterActivity(e.target.value as ActivityType | "all")} className="text-xs font-semibold px-2 py-1 rounded-lg border border-border bg-card focus:outline-none">
            <option value="all">{t.allActivities}</option>
            {allActivityTypes.map(a => <option key={a} value={a}>{t.acts[a]}</option>)}
          </select>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value as Level | "all")} className="text-xs font-semibold px-2 py-1 rounded-lg border border-border bg-card focus:outline-none">
            <option value="all">{t.allLevels}</option>
            {(["beginner", "intermediate", "high-intermediate", "advanced", "pro"] as Level[]).map(l => <option key={l} value={l}>{t.levels[l]}</option>)}
          </select>
          <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} className="text-xs font-semibold px-2 py-1 rounded-lg border border-border bg-card focus:outline-none">
            <option value="all">{t.allVenues}</option>
            {allVenues.map(v => <option key={v.id} value={v.id}>{lang === "pl" ? v.namePl : v.nameEn}</option>)}
          </select>
          <button onClick={() => setFilterCoach(f => !f)} className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full transition-colors ${filterCoach ? "bg-amber-100 text-amber-700 border border-amber-300" : "bg-muted text-muted-foreground border border-border"}`}>
            🏅 {t.coach}
          </button>
        </div>
      </div>
      <div className="px-4 pb-6 max-w-xl mx-auto w-full">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground"><div className="text-3xl mb-2">🔍</div><p className="text-sm">{lang === "pl" ? "Brak wyników" : "No results"}</p></div>}
          {filtered.map((user, i) => (
            <div key={user.id} className={i < filtered.length - 1 ? "border-b border-border" : ""}>
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover" />
                  {user.isCoach && <span className="absolute -bottom-1 -right-1 text-sm">🏅</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{user.username}</span>
                    {currentUser?.id === user.id && <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">you</span>}
                    {user.isCoach && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-full">{t.coach}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1.5">📍 {user.city}</div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {user.activities.map(a => (
                      <span key={a.activity} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activityBg(a.activity)}`}>
                        {activityIcon(a.activity)} {T[lang].acts[a.activity]}{a.level ? ` · ${T[lang].levels[a.level]}` : ""}
                      </span>
                    ))}
                  </div>
                  {user.languages && user.languages.length > 0 && (
                    <div className="text-xs text-muted-foreground">{t.speaksLabel} {user.languages.join(", ")}</div>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{user.bio}</p>
                </div>
                {currentUser && currentUser.id !== user.id && (
                  <button onClick={() => onMessage(user)} className="flex items-center gap-1 text-xs font-bold px-2.5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex-shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Messages View ────────────────────────────────────────────────────────────

function MessagesView({ lang, currentUser, messages, setMessages, initialTarget, setInitialTarget, onLoginRequired, allUsers }: {
  lang: Lang; currentUser: AppUser | null
  messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  initialTarget: AppUser | null; setInitialTarget: (u: AppUser | null) => void
  onLoginRequired: () => void; allUsers: AppUser[]
}) {
  const t = T[lang]
  const [activeUserId, setActiveUserId] = useState<string | null>(initialTarget?.id ?? null)
  const [draft, setDraft] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mobileShowConvo, setMobileShowConvo] = useState(!!initialTarget)

  useEffect(() => {
    if (initialTarget) { setActiveUserId(initialTarget.id); setMobileShowConvo(true); setInitialTarget(null) }
  }, [initialTarget])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [activeUserId, messages])

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">{t.loginRequired}</p>
        <button onClick={onLoginRequired} className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">{t.login}</button>
      </div>
    )
  }

  const conversations = useMemo(() => {
    const others = new Set<string>()
    messages.forEach(m => {
      if (m.fromId === currentUser.id) others.add(m.toId)
      if (m.toId === currentUser.id) others.add(m.fromId)
    })
    return Array.from(others).map(uid => ({
      user: getUserById(uid, allUsers, currentUser),
      lastMsg: messages.filter(m => (m.fromId === uid || m.toId === uid)).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0],
    })).filter(c => c.user).sort((a, b) => (b.lastMsg?.timestamp.getTime() ?? 0) - (a.lastMsg?.timestamp.getTime() ?? 0))
  }, [messages, currentUser, allUsers])

  const activeUser = getUserById(activeUserId ?? "", allUsers, currentUser)
  const convoMessages = messages.filter(m =>
    (m.fromId === currentUser.id && m.toId === activeUserId) ||
    (m.fromId === activeUserId && m.toId === currentUser.id)
  ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  function sendMessage() {
    if (!draft.trim() || !activeUserId) return
    setMessages(prev => [...prev, { id: `m${Date.now()}`, fromId: currentUser.id, toId: activeUserId, text: draft.trim(), timestamp: new Date() }])
    setDraft("")
  }

  return (
    <div className="flex h-[calc(100vh-57px-64px)] md:h-[calc(100vh-57px)] overflow-hidden">
      <div className={`flex flex-col bg-card border-r border-border flex-shrink-0 ${mobileShowConvo ? "hidden md:flex" : "flex w-full md:w-72"}`}>
        <div className="px-4 py-3 border-b border-border font-bold flex items-center gap-2" style={{ fontFamily: "Righteous, sans-serif" }}>
          <MessageCircle className="w-5 h-5 text-primary" />{t.messages}
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">{t.noConversations}</div>}
          {conversations.map(({ user, lastMsg }) => {
            if (!user) return null
            const active = activeUserId === user.id
            return (
              <button key={user.id} onClick={() => { setActiveUserId(user.id); setMobileShowConvo(true) }} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-b border-border ${active ? "bg-green-50" : ""}`}>
                <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{user.username}</div>
                  {lastMsg && <div className="text-xs text-muted-foreground truncate">{lastMsg.text}</div>}
                </div>
                {lastMsg && <div className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(lastMsg.timestamp, lang)}</div>}
              </button>
            )
          })}
        </div>
      </div>
      <div className={`flex-1 flex flex-col ${!mobileShowConvo ? "hidden md:flex" : "flex"}`}>
        {activeUser ? (
          <>
            <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
              <button className="md:hidden mr-1" onClick={() => setMobileShowConvo(false)}><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
              <img src={activeUser.avatar} alt={activeUser.username} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">{activeUser.username}{activeUser.isCoach && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-full">{T[lang].coach}</span>}</div>
                <div className="text-xs text-muted-foreground">📍 {activeUser.city}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {convoMessages.length === 0 && <div className="text-center text-muted-foreground text-sm py-8">{t.noMessages}</div>}
              {convoMessages.map(msg => {
                const isMe = msg.fromId === currentUser.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"}`}>
                      {msg.text}
                      <div className={`text-xs mt-0.5 ${isMe ? "text-green-200" : "text-muted-foreground"}`}>{timeAgo(msg.timestamp, lang)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-3 border-t border-border bg-card flex gap-2">
              <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder={t.writeMessage} className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={sendMessage} className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:opacity-90 transition-opacity"><Send className="w-4 h-4" /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <MessageCircle className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">{t.selectConversation}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Profile View ─────────────────────────────────────────────────────────────

function ProfileView({ lang, currentUser, setCurrentUser, venueUsers, onLogout, setView, onSelectVenue, allVenues, allUsers }: {
  lang: Lang; currentUser: AppUser | null
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>
  venueUsers: Record<string, VenueEntry[]>
  onLogout: () => void; setView: (v: View) => void
  onSelectVenue: (v: Venue) => void; allVenues: Venue[]; allUsers: AppUser[]
}) {
  const t = T[lang]
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <User className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">{t.loginRequired}</p>
      </div>
    )
  }

  const myVenues = allVenues.filter(v => (venueUsers[v.id] ?? []).some(e => e.userId === currentUser.id))

  return (
    <div className="px-4 py-5 max-w-xl mx-auto w-full">
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img src={currentUser.avatar} alt={currentUser.username} className="w-16 h-16 rounded-full object-cover" />
            {currentUser.isCoach && <span className="absolute -bottom-1 -right-1 text-xl">🏅</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-bold text-xl" style={{ fontFamily: "Righteous, sans-serif" }}>{currentUser.username}</div>
              {currentUser.isCoach && <span className="text-sm bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">{t.coach}</span>}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5" /> {currentUser.city}</div>
            <p className="text-sm text-foreground mt-2 leading-relaxed">{currentUser.bio}</p>
            {currentUser.languages && currentUser.languages.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1"><Globe className="w-3 h-3 inline mr-1" />{t.speaksLabel} {currentUser.languages.join(", ")}</div>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{t.activities}</div>
          <div className="flex flex-wrap gap-2">
            {currentUser.activities.map(a => (
              <span key={a.activity} className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${activityBg(a.activity)}`}>
                {activityIcon(a.activity)} {T[lang].acts[a.activity]}{a.level ? ` · ${T[lang].levels[a.level]}` : ""}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setView("profile-edit")} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors">
            <Edit2 className="w-4 h-4" />{t.editProfile}
          </button>
          <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />{t.logout}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border font-bold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{t.yourVenues} ({myVenues.length})</div>
        {myVenues.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">{t.noVenues}</div>
        ) : (
          <div className="divide-y divide-border">
            {myVenues.map(v => (
              <button key={v.id} onClick={() => onSelectVenue(v)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left">
                <span className="text-xl">{venueIcon(v.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{lang === "pl" ? v.namePl : v.nameEn}</div>
                  <div className="text-xs text-muted-foreground">{v.address}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-red-700 mb-3">{t.deleteProfileConfirm}</p>
          <div className="flex gap-2">
            <button onClick={onLogout} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold">{t.deleteProfile}</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold">{t.cancel}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors">
          <Trash2 className="w-4 h-4" />{t.deleteProfile}
        </button>
      )}
    </div>
  )
}

// ─── Profile Edit View ────────────────────────────────────────────────────────

function ProfileEditView({ lang, currentUser, setCurrentUser, setView }: {
  lang: Lang; currentUser: AppUser; setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>; setView: (v: View) => void
}) {
  const t = T[lang]
  const [username, setUsername] = useState(currentUser.username)
  const [city, setCity] = useState(currentUser.city)
  const [bio, setBio] = useState(currentUser.bio)
  const [selectedActivities, setSelectedActivities] = useState<{ activity: ActivityType; level?: Level }[]>(currentUser.activities)
  const [selectedLangs, setSelectedLangs] = useState<string[]>(currentUser.languages ?? [])
  const [isCoach, setIsCoach] = useState(currentUser.isCoach ?? false)

  const allActivityTypes: ActivityType[] = ["tennis", "basketball", "football", "fitness", "outdoor", "swimming", "hiking", "climbing", "walking", "running", "other"]
  const langOptions = T[lang].langOptions

  function toggleActivity(a: ActivityType) {
    setSelectedActivities(prev => prev.some(x => x.activity === a) ? prev.filter(x => x.activity !== a) : [...prev, { activity: a, level: a !== "other" ? "intermediate" : undefined }])
  }
  function setActivityLevel(a: ActivityType, l: Level) {
    setSelectedActivities(prev => prev.map(x => x.activity === a ? { ...x, level: l } : x))
  }
  function toggleLang(l: string) {
    setSelectedLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])
  }

  function handleSave() {
    setCurrentUser(prev => prev ? { ...prev, username, city, bio, activities: selectedActivities, languages: selectedLangs, isCoach } : prev)
    setView("profile")
  }

  return (
    <div className="px-4 py-5 max-w-xl mx-auto w-full pb-10">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setView("profile")} className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />{t.back}
        </button>
        <h1 className="font-bold text-lg flex-1" style={{ fontFamily: "Righteous, sans-serif" }}>{t.editProfile}</h1>
        <button onClick={handleSave} className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">{t.save}</button>
      </div>
      <div className="flex flex-col gap-4">
        <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.username}</label><input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
        <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.cityLabel}</label><input value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
        <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.bio}</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">{t.activities}</label>
          <div className="flex flex-col gap-2">
            {allActivityTypes.map(a => {
              const sel = selectedActivities.find(x => x.activity === a)
              return (
                <div key={a} className={`rounded-xl border p-3 transition-colors ${sel ? "border-primary bg-green-50" : "border-border"}`}>
                  <button onClick={() => toggleActivity(a)} className="flex items-center gap-2 w-full">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${sel ? "bg-primary border-primary" : "border-border"}`}>{sel && <Check className="w-2.5 h-2.5 text-white" />}</div>
                    <span className="text-sm font-semibold">{activityIcon(a)} {T[lang].acts[a]}</span>
                  </button>
                  {sel && a !== "other" && (
                    <div className="flex flex-wrap gap-1 ml-6 mt-2">
                      {(["beginner", "intermediate", "high-intermediate", "advanced", "pro"] as Level[]).map(l => (
                        <button key={l} onClick={() => setActivityLevel(a, l)} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${sel.level === l ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}>{T[lang].levels[l]}</button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">{t.languages}</label>
          <div className="flex flex-wrap gap-2">
            {langOptions.map(l => (
              <button key={l} onClick={() => toggleLang(l)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${selectedLangs.includes(l) ? "bg-primary text-primary-foreground border-transparent" : "border-border hover:border-primary"}`}>{l}</button>
            ))}
          </div>
        </div>
        <button onClick={() => setIsCoach(c => !c)} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${isCoach ? "border-amber-300 bg-amber-50" : "border-border"}`}>
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isCoach ? "bg-amber-400 border-amber-400" : "border-border"}`}>{isCoach && <Check className="w-3 h-3 text-white" />}</div>
          <span className="text-sm font-semibold">🏅 {t.coachBadge}</span>
        </button>
      </div>
    </div>
  )
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

function AuthModal({ lang, onLogin, onClose, mode, setMode }: {
  lang: Lang; onLogin: (user: AppUser) => void; onClose: () => void
  mode: "login" | "register"; setMode: (m: "login" | "register") => void
}) {
  const t = T[lang]
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [city, setCity] = useState("Kraków")
  const [bio, setBio] = useState("")
  const [selectedActivities, setSelectedActivities] = useState<{ activity: ActivityType; level?: Level }[]>([])
  const [selectedLangs, setSelectedLangs] = useState<string[]>([])
  const [isCoach, setIsCoach] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [showVerify, setShowVerify] = useState(false)

  const allActivityTypes: ActivityType[] = ["tennis", "basketball", "football", "fitness", "outdoor", "swimming", "hiking", "climbing", "walking", "running", "other"]
  const langOptions = T[lang].langOptions

  function toggleActivity(a: ActivityType) {
    setSelectedActivities(prev => prev.some(x => x.activity === a) ? prev.filter(x => x.activity !== a) : [...prev, { activity: a, level: a !== "other" ? "intermediate" : undefined }])
  }
  function setActivityLevel(a: ActivityType, l: Level) {
    setSelectedActivities(prev => prev.map(x => x.activity === a ? { ...x, level: l } : x))
  }
  function toggleLang(l: string) {
    setSelectedLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])
  }

  function handleRegister() {
    if (!username.trim() || !privacyAgreed) return
    setShowVerify(true)
  }

  function handleVerifyDone() {
    const newUser: AppUser = {
      id: `u${Date.now()}`,
      username: username.trim(),
      city: city || "Kraków",
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      bio: bio.trim(),
      email: email.trim(),
      activities: selectedActivities.length > 0 ? selectedActivities : [{ activity: "tennis", level: "intermediate" }],
      languages: selectedLangs,
      isCoach,
    }
    onLogin(newUser)
  }

  if (showVerify) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border p-6 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="font-bold text-xl mb-2" style={{ fontFamily: "Righteous, sans-serif" }}>{t.verifyEmailTitle}</h2>
          <p className="text-sm text-muted-foreground mb-2">{lang === "pl" ? "Wysłaliśmy link weryfikacyjny na:" : "We've sent a verification link to:"}</p>
          <p className="font-bold text-primary mb-4">{email || "twój@email.com"}</p>
          <p className="text-sm text-muted-foreground mb-5">{t.verifyEmail}</p>
          <button onClick={handleVerifyDone} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
            {lang === "pl" ? "Już zweryfikowałem/am — zaloguj mnie" : "I've verified — log me in"}
          </button>
          <p className="text-xs text-muted-foreground mt-2">{lang === "pl" ? "(demo: kliknij aby pominąć)" : "(demo: click to skip)"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-card px-5 pt-5 pb-4 border-b border-border flex items-center justify-between z-10">
          <h2 className="font-bold text-lg" style={{ fontFamily: "Righteous, sans-serif" }}>{mode === "login" ? t.loginTitle : t.registerTitle}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex bg-muted rounded-xl p-1">
            <button onClick={() => setMode("login")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === "login" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>{t.login}</button>
            <button onClick={() => setMode("register")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === "register" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>{t.register}</button>
          </div>

          {mode === "login" ? (
            <div className="flex flex-col gap-3">
              <button onClick={() => onLogin(DEMO_USER)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">🎮 {t.demoLogin}</button>
              <p className="text-xs text-muted-foreground text-center">{lang === "pl" ? "Wersja demonstracyjna" : "Demo version"}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.username} *</label><input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="np. Marek_W" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.email}</label><input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="ty@example.com" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.cityLabel}</label><input value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Kraków" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.bio}</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder={lang === "pl" ? "Kilka słów o sobie..." : "A few words about yourself..."} /></div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2">{t.activities}</label>
                <div className="flex flex-col gap-2">
                  {allActivityTypes.map(a => {
                    const sel = selectedActivities.find(x => x.activity === a)
                    return (
                      <div key={a} className={`rounded-xl border p-3 transition-colors ${sel ? "border-primary bg-green-50" : "border-border"}`}>
                        <button onClick={() => toggleActivity(a)} className="flex items-center gap-2 w-full">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${sel ? "bg-primary border-primary" : "border-border"}`}>{sel && <CheckCircle className="w-3 h-3 text-white" />}</div>
                          <span className="text-sm font-semibold">{activityIcon(a)} {T[lang].acts[a]}</span>
                        </button>
                        {sel && a !== "other" && (
                          <div className="flex flex-wrap gap-1 ml-6 mt-2">
                            {(["beginner", "intermediate", "high-intermediate", "advanced", "pro"] as Level[]).map(l => (
                              <button key={l} onClick={() => setActivityLevel(a, l)} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${sel.level === l ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}>{T[lang].levels[l]}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2">{t.languages}</label>
                <div className="flex flex-wrap gap-2">
                  {langOptions.map(l => (
                    <button key={l} onClick={() => toggleLang(l)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${selectedLangs.includes(l) ? "bg-primary text-primary-foreground border-transparent" : "border-border hover:border-primary"}`}>{l}</button>
                  ))}
                </div>
              </div>

              <button onClick={() => setIsCoach(c => !c)} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${isCoach ? "border-amber-300 bg-amber-50" : "border-border"}`}>
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${isCoach ? "bg-amber-400 border-amber-400" : "border-border"}`}>{isCoach && <CheckCircle className="w-3 h-3 text-white" />}</div>
                <div>
                  <span className="text-sm font-semibold">🏅 {t.coachBadge}</span>
                  <p className="text-xs text-muted-foreground">{lang === "pl" ? "Pojawi się odznaka trenera na Twoim profilu" : "A coach badge will appear on your profile"}</p>
                </div>
              </button>

              <div className="bg-muted/60 border border-border rounded-xl p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{t.privacy}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.privacyText}</p>
                  </div>
                </div>
                <button onClick={() => setPrivacyAgreed(p => !p)} className="flex items-start gap-2 w-full text-left">
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${privacyAgreed ? "bg-primary border-primary" : "border-border"}`}>{privacyAgreed && <CheckCircle className="w-2.5 h-2.5 text-white" />}</div>
                  <span className="text-xs text-foreground">{t.privacyAgree}</span>
                </button>
              </div>

              <button onClick={handleRegister} disabled={!username.trim() || !privacyAgreed} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                <UserPlus className="w-4 h-4 inline mr-1.5" />{t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add Venue Modal ──────────────────────────────────────────────────────────

function AddVenueModal({ lang, currentUser, onAdd, onClose }: {
  lang: Lang; currentUser: AppUser; onAdd: (v: Venue) => void; onClose: () => void
}) {
  const t = T[lang]
  const [namePl, setNamePl] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [type, setType] = useState<VenueType>("tennis-court")
  const [section, setSection] = useState<Section>("gram-tu")
  const [address, setAddress] = useState("")
  const [website, setWebsite] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [bio, setBio] = useState("")

  const allVenueTypes: VenueType[] = ["tennis-court", "basketball-court", "football-pitch", "outdoor-training", "fitness-center", "swimming-pool", "hiking-trail", "climbing-wall", "running-track", "other"]

  function handleAdd() {
    if (!namePl.trim() || !address.trim()) return
    const newVenue: Venue = {
      id: `uv${Date.now()}`,
      namePl: namePl.trim(),
      nameEn: nameEn.trim() || namePl.trim(),
      type,
      section,
      lat: 50.0647 + (Math.random() - 0.5) * 0.04,
      lng: 19.9450 + (Math.random() - 0.5) * 0.06,
      address: address.trim(),
      website: website.trim() || undefined,
      initialUsers: [],
      addedBy: currentUser.id,
      imageUrl: imageUrl.trim() || undefined,
      bioPl: bio.trim() || undefined,
      bioEn: bio.trim() || undefined,
    }
    onAdd(newVenue)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-card px-5 pt-5 pb-4 border-b border-border flex items-center justify-between z-10">
          <h2 className="font-bold text-lg" style={{ fontFamily: "Righteous, sans-serif" }}>{t.addVenueTitle}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.venueNamePl} *</label><input value={namePl} onChange={e => setNamePl(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="np. Korty Miejskie" /></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.venueNameEn}</label><input value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. City Courts" /></div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">{t.venueType}</label>
            <select value={type} onChange={e => setType(e.target.value as VenueType)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {allVenueTypes.map(vt => <option key={vt} value={vt}>{venueIcon(vt)} {T[lang].venueTypes[vt]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">{t.section}</label>
            <div className="flex gap-2">
              <button onClick={() => setSection("gram-tu")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${section === "gram-tu" ? "bg-primary text-primary-foreground border-transparent" : "border-border"}`}>⚽ {t.gramTu}</button>
              <button onClick={() => setSection("trenuje-tu")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${section === "trenuje-tu" ? "bg-accent text-accent-foreground border-transparent" : "border-border"}`}>💪 {t.trenujeTu}</button>
            </div>
          </div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.address} *</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="ul. Przykładowa 1, Kraków" /></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.website}</label><input value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." /></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.imageUrl}</label><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." /></div>
          <div><label className="block text-xs font-bold text-muted-foreground mb-1">{t.venueBio}</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder={lang === "pl" ? "Opisz obiekt..." : "Describe the venue..."} /></div>
          <button onClick={handleAdd} disabled={!namePl.trim() || !address.trim()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
            <Plus className="w-4 h-4 inline mr-1.5" />{t.addVenue}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Notifications Panel ──────────────────────────────────────────────────────

function NotificationsPanel({ lang, notifications, setNotifications, onClose, onClickNotification }: {
  lang: Lang; notifications: AppNotification[]
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>
  onClose: () => void; onClickNotification: (n: AppNotification) => void
}) {
  const t = T[lang]
  function markAllRead() { setNotifications(prev => prev.map(n => ({ ...n, read: true }))) }

  return (
    <div className="fixed inset-0 z-40 flex justify-end pt-[57px]">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-80 bg-card border-l border-border shadow-2xl flex flex-col h-[calc(100%-57px)]">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-bold" style={{ fontFamily: "Righteous, sans-serif" }}>{t.notifications}</span>
          <button onClick={markAllRead} className="text-xs text-primary font-semibold hover:underline">{lang === "pl" ? "Oznacz wszystkie" : "Mark all read"}</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">{t.noNotifications}</div>}
          {notifications.map(n => (
            <button key={n.id} onClick={() => { setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x)); onClickNotification(n) }} className={`w-full px-4 py-3 border-b border-border flex gap-3 text-left hover:bg-muted transition-colors ${!n.read ? "bg-green-50" : ""}`}>
              <div className="text-lg">{n.type === "message" ? "💬" : "📍"}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{lang === "pl" ? n.textPl : n.textEn}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.timestamp, lang)}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper used in ProfileEditView
function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState<Lang>("pl")
  const [view, setView] = useState<View>("home")
  const [section, setSection] = useState<Section>("gram-tu")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [messageTarget, setMessageTarget] = useState<AppUser | null>(null)
  const [venueUsers, setVenueUsers] = useState<Record<string, VenueEntry[]>>(() =>
    Object.fromEntries(VENUES_DATA.map(v => [v.id, v.initialUsers]))
  )
  const [userAddedVenues, setUserAddedVenues] = useState<Venue[]>([])
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [showAddVenue, setShowAddVenue] = useState(false)

  const allVenues = useMemo(() => [...VENUES_DATA, ...userAddedVenues], [userAddedVenues])
  const allUsers = useMemo(() => currentUser ? [currentUser, ...USERS.filter(u => u.id !== currentUser.id)] : USERS, [currentUser])

  const unreadNotifications = notifications.filter(n => !n.read).length
  const unreadMessages = currentUser ? messages.filter(m => m.toId === currentUser.id).length > 0 ? 1 : 0 : 0

  function handleSelectVenue(v: Venue) { setSelectedVenue(v); setSection(v.section); setView("venue-detail") }

  function handleMessage(user: AppUser) {
    if (!currentUser) { setShowAuth(true); return }
    setMessageTarget(user); setView("messages")
  }

  function handleLogin(user: AppUser) { setCurrentUser(user); setShowAuth(false); setNotifications(INITIAL_NOTIFICATIONS) }

  function handleLogout() { setCurrentUser(null); setView("home") }

  function handleDeleteVenue(id: string) {
    setUserAddedVenues(prev => prev.filter(v => v.id !== id))
    setVenueUsers(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  function handleAddVenue(v: Venue) {
    setUserAddedVenues(prev => [...prev, v])
    setVenueUsers(prev => ({ ...prev, [v.id]: [] }))
    setNotifications(prev => [{
      id: `n${Date.now()}`, type: "new-venue",
      textPl: `Nowy obiekt dodany przez ${currentUser?.username}: ${v.namePl}`,
      textEn: `New venue added by ${currentUser?.username}: ${v.nameEn}`,
      read: false, timestamp: new Date(), venueId: v.id,
    }, ...prev])
  }

  function handleNotificationClick(n: AppNotification) {
    setShowNotifications(false)
    if (n.type === "message" && n.fromUserId) {
      const user = USERS.find(u => u.id === n.fromUserId)
      if (user) { setMessageTarget(user); setView("messages") }
    } else if (n.type === "new-venue" && n.venueId) {
      const venue = allVenues.find(v => v.id === n.venueId)
      if (venue) handleSelectVenue(venue)
    }
  }

  const t = T[lang]

  const navItems = [
    { id: "home" as View, icon: <Home className="w-5 h-5" />, label: t.home },
    { id: "map" as View, icon: <Map className="w-5 h-5" />, label: t.map },
    { id: "venues-gram" as const, icon: <span className="text-lg leading-none">⚽</span>, label: t.gramTu, action: () => { setSection("gram-tu"); setView("venues") } },
    { id: "venues-trenuje" as const, icon: <span className="text-lg leading-none">💪</span>, label: t.trenujeTu, action: () => { setSection("trenuje-tu"); setView("venues") } },
    { id: "users" as View, icon: <Users className="w-5 h-5" />, label: t.users },
    { id: "messages" as View, icon: <MessageCircle className="w-5 h-5" />, label: t.messages },
  ]

  function isNavActive(id: string): boolean {
    if (id === "venues-gram") return (view === "venues" || view === "venue-detail") && section === "gram-tu"
    if (id === "venues-trenuje") return (view === "venues" || view === "venue-detail") && section === "trenuje-tu"
    return view === id
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "Nunito, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-6xl mx-auto">
          <button onClick={() => setView("home")} className="font-bold text-xl text-primary" style={{ fontFamily: "Righteous, sans-serif" }}>Gram Tu 🏆</button>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setLang(l => l === "pl" ? "en" : "pl")} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <Globe className="w-3.5 h-3.5" />{lang === "pl" ? "EN" : "PL"}
            </button>
            <button onClick={() => setShowNotifications(s => !s)} className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadNotifications}</span>}
            </button>
            {currentUser ? (
              <button onClick={() => setView("profile")} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors">
                <div className="relative">
                  <img src={currentUser.avatar} alt={currentUser.username} className="w-7 h-7 rounded-full object-cover" />
                  {currentUser.isCoach && <span className="absolute -bottom-0.5 -right-0.5 text-xs">🏅</span>}
                </div>
                <span className="text-xs font-bold hidden sm:block">{currentUser.username}</span>
              </button>
            ) : (
              <button onClick={() => { setAuthMode("login"); setShowAuth(true) }} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <LogIn className="w-3.5 h-3.5" /><span className="hidden sm:block">{t.login}</span>
              </button>
            )}
          </div>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex border-t border-border px-4 overflow-x-auto max-w-6xl mx-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={item.action ?? (() => setView(item.id as View))} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${isNavActive(item.id) ? item.id.includes("trenuje") ? "border-accent text-accent" : "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {item.icon}<span>{item.label}</span>
              {item.id === "messages" && unreadMessages > 0 && <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unreadMessages}</span>}
            </button>
          ))}
          {currentUser && <button onClick={handleLogout} className="ml-auto flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 border-transparent text-muted-foreground hover:text-red-500 transition-colors whitespace-nowrap"><LogOut className="w-4 h-4" />{t.logout}</button>}
        </div>
      </header>

      {/* Overlays */}
      {showNotifications && <NotificationsPanel lang={lang} notifications={notifications} setNotifications={setNotifications} onClose={() => setShowNotifications(false)} onClickNotification={handleNotificationClick} />}
      {showAuth && <AuthModal lang={lang} onLogin={handleLogin} onClose={() => setShowAuth(false)} mode={authMode} setMode={setAuthMode} />}
      {showAddVenue && currentUser && <AddVenueModal lang={lang} currentUser={currentUser} onAdd={handleAddVenue} onClose={() => setShowAddVenue(false)} />}

      {/* Main Content */}
      <main className="pb-20 md:pb-0 max-w-6xl mx-auto">
        {view === "home" && <HomeView lang={lang} setView={setView} setSection={setSection} venueUsers={venueUsers} currentUser={currentUser} allVenues={allVenues} allUsers={allUsers} onSelectVenue={handleSelectVenue} />}
        {view === "venues" && <VenuesView lang={lang} section={section} setSection={setSection} venueUsers={venueUsers} onSelectVenue={handleSelectVenue} currentUser={currentUser} allVenues={allVenues} allUsers={allUsers} onAddVenue={() => currentUser ? setShowAddVenue(true) : setShowAuth(true)} />}
        {view === "venue-detail" && selectedVenue && (
          <VenueDetailView
            venue={selectedVenue} lang={lang} currentUser={currentUser}
            venueUsers={venueUsers} setVenueUsers={setVenueUsers}
            onMessage={handleMessage}
            onBack={() => { setView("venues"); setSection(selectedVenue.section) }}
            onLoginRequired={() => setShowAuth(true)}
            allUsers={allUsers} comments={comments} setComments={setComments}
            onDeleteVenue={handleDeleteVenue}
          />
        )}
        {view === "map" && <MapView lang={lang} venueUsers={venueUsers} onSelectVenue={handleSelectVenue} allVenues={allVenues} allUsers={allUsers} currentUser={currentUser} />}
        {view === "users" && <UsersView lang={lang} currentUser={currentUser} venueUsers={venueUsers} onMessage={handleMessage} allUsers={allUsers} allVenues={allVenues} />}
        {view === "messages" && <MessagesView lang={lang} currentUser={currentUser} messages={messages} setMessages={setMessages} initialTarget={messageTarget} setInitialTarget={setMessageTarget} onLoginRequired={() => setShowAuth(true)} allUsers={allUsers} />}
        {view === "profile" && <ProfileView lang={lang} currentUser={currentUser} setCurrentUser={setCurrentUser} venueUsers={venueUsers} onLogout={handleLogout} setView={setView} onSelectVenue={handleSelectVenue} allVenues={allVenues} allUsers={allUsers} />}
        {view === "profile-edit" && currentUser && <ProfileEditView lang={lang} currentUser={currentUser} setCurrentUser={setCurrentUser} setView={setView} />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="grid grid-cols-6 h-16">
          {navItems.map(item => {
            const active = isNavActive(item.id)
            const isTrenuje = item.id === "venues-trenuje"
            return (
              <button key={item.id} onClick={item.action ?? (() => setView(item.id as View))} className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${active ? isTrenuje ? "text-accent" : "text-primary" : "text-muted-foreground"}`}>
                {item.icon}
                <span className="text-[9px] font-bold leading-none truncate w-full text-center px-0.5">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
