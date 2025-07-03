export interface Turno {
  id: string;
  user_id: string;
  giorno: string;
  inizio_1: string;
  fine_1: string;
  inizio_2?: string;
  fine_2?: string;
  inizio_3?: string;
  fine_3?: string;
  tipo: "NORMALE" | "RIPOSO" | "FESTIVO" | "FERIE" | "RECUPERO";
  note?: string;
}
