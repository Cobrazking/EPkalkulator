# EPKalk - Kalkyleverktøy

EPKalk er et profesjonelt kalkyleverktøy for prosjektstyring og kostnadsberegning.

## Funksjoner

- **Organisasjonsstyring**: Administrer flere organisasjoner med brukertilganger
- **Prosjektadministrasjon**: Opprett og administrer prosjekter for kunder
- **Kalkyler**: Detaljerte kostnadsberegninger med materiell og arbeidstimer
- **Brukeradministrasjon**: Inviter og administrer brukere med forskjellige roller
- **E-postinvitasjoner**: Send automatiske invitasjoner via e-post
- **PDF-eksport**: Generer profesjonelle tilbud som PDF
- **Excel-eksport**: Eksporter kalkyler til Excel-format

## Teknologi

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **E-post**: Resend eller SendGrid
- **PDF**: React-PDF
- **Hosting**: Netlify

## Oppsett

### 1. Klone prosjektet

```bash
git clone <repository-url>
cd epkalk
npm install
```

### 2. Supabase oppsett

1. Opprett et nytt Supabase-prosjekt på [supabase.com](https://supabase.com)
2. Kjør migrasjonene i `supabase/migrations/` mappen
3. Kopier URL og anon key fra Supabase dashboard

### 3. E-post oppsett

Velg en e-posttjeneste:

#### Resend (anbefalt)
1. Opprett konto på [resend.com](https://resend.com)
2. Få API-nøkkel fra dashboard
3. Sett opp domene for sending (valgfritt)

#### SendGrid
1. Opprett konto på [sendgrid.com](https://sendgrid.com)
2. Få API-nøkkel fra dashboard
3. Verifiser sender-domene

### 4. Miljøvariabler

Kopier `.env.example` til `.env` og fyll inn verdiene:

```bash
cp .env.example .env
```

Rediger `.env` med dine verdier:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# E-post (velg en)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourdomain.com
```

### 5. Deploy Edge Functions

Edge Functions må deployes til Supabase for e-postfunksjonalitet:

```bash
# Installer Supabase CLI
npm install -g supabase

# Login til Supabase
supabase login

# Link til ditt prosjekt
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy send-invitation-email
```

### 6. Sett miljøvariabler i Supabase

I Supabase dashboard under Settings > Edge Functions, legg til:

```
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourdomain.com
```

### 7. Start utviklingsserver

```bash
npm run dev
```

## Bruk

### Første gangs oppsett

1. Opprett en konto ved å registrere deg
2. Opprett din første organisasjon
3. Legg til kunder og prosjekter
4. Inviter andre brukere til organisasjonen

### Invitere brukere

1. Gå til "Brukere" siden
2. Klikk "Send invitasjon"
3. Fyll inn e-post, navn og rolle
4. Personen mottar en e-post med invitasjonslenke
5. De kan opprette konto eller logge inn for å bli med

### Roller

- **Administrator**: Full tilgang til organisasjonen
- **Manager**: Kan administrere brukere og prosjekter
- **Bruker**: Kan se og redigere egne data

## Deployment

### Netlify

1. Koble GitHub repository til Netlify
2. Sett build command: `npm run build`
3. Sett publish directory: `dist`
4. Legg til miljøvariabler i Netlify dashboard

### Supabase Edge Functions

Edge Functions deployes separat til Supabase og håndterer e-postutsending.

## Feilsøking

### E-post sendes ikke

1. Sjekk at Edge Function er deployet
2. Verifiser API-nøkler i Supabase dashboard
3. Sjekk Edge Function logs i Supabase

### Invitasjoner fungerer ikke

1. Sjekk at database-migrasjoner er kjørt
2. Verifiser at RLS-policies er korrekte
3. Sjekk browser console for feilmeldinger

## Lisens

Proprietær programvare. Alle rettigheter forbeholdt.