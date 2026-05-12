import React from "react";
import { 
  Waves, 
  Mountain, 
  Sword, 
  Activity, 
  Users, 
  Hash,
  Zap,
  Target
} from "lucide-react";
import { 
  MdSportsBasketball, 
  MdSportsVolleyball, 
  MdSportsTennis,
  MdDirectionsRun,
  MdPool,
  MdSportsMma,
  MdHiking,
  MdSportsBaseball
} from "react-icons/md";

export const sportIcons: Record<string, React.ReactNode> = {
  "Atletika": <MdDirectionsRun size={14} />,
  "Basketbal": <MdSportsBasketball size={14} />,
  "Basketbal (rekreační)": <MdSportsBasketball size={14} />,
  "Volejbal": <MdSportsVolleyball size={14} />,
  "Plavání": <MdPool size={14} />,
  "Tenis": <MdSportsTennis size={14} />,
  "Florbal": <Target size={14} />,
  "Lyžování": <Mountain size={14} />,
  "Aikibudo": <MdSportsMma size={14} />,
  "Turistika": <MdHiking size={14} />,
  "Kanoistika": <Waves size={14} />,
  "Šerm": <Sword size={14} />,
  "Stolní tenis": <Activity size={14} />,
  "Šachy": <Hash size={14} />,
  "Cheerleaders": <Zap size={14} />,
  "Moderní gymnastika": <Activity size={14} />,
  "Sportovní aerobik": <Activity size={14} />,
  "Skoky do vody": <Waves size={14} />,
  "Softball": <MdSportsBaseball size={14} />,
  "Synchronizované plavání": <Waves size={14} />,
  "ČASPV": <Users size={14} />,
};

export const getSportIcon = (name: string) => {
    const icon = sportIcons[name];
    if (!icon) return null;
    
    // If we want to override size dynamically, we'd need to clone or use a different approach.
    // For now, the pre-defined 14 is fine.
    return icon;
};

