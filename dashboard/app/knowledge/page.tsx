'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Search,
  Car,
  Zap,
  Shield,
  Gauge,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Euro,
  Calendar,
  Users,
  Fuel,
  Settings
} from "lucide-react"

interface VehicleModel {
  id: string;
  name: string;
  category: 'Sedan' | 'SUV' | 'Coupé' | 'AMG' | 'EQ';
  year: number;
  priceRange: string;
  image?: string;
  specs: {
    engine: string;
    power: string;
    acceleration: string;
    topSpeed: string;
    fuelType: string;
    transmission: string;
  };
  features: string[];
  marketingHighlights: string[];
  targetAudience: string;
  description: string;
}

const mercedesModels: VehicleModel[] = [
  // Sedan Category
  {
    id: 'classe-a',
    name: 'Classe A Sedan',
    category: 'Sedan',
    year: 2024,
    priceRange: '€35.000 - €45.000',
    description: 'O sedan compacto premium que redefine a entrada na família Mercedes-Benz.',
    specs: {
      engine: '1.3L Turbo / 2.0L Turbo',
      power: '163 - 224 CV',
      acceleration: '6.9 - 8.7s (0-100 km/h)',
      topSpeed: '225 - 250 km/h',
      fuelType: 'Gasolina',
      transmission: '7G-DCT / 8G-DCT'
    },
    features: [
      'MBUX - Mercedes-Benz User Experience',
      'Tela multimídia de 10.25"',
      'Comando de voz "Hey Mercedes"',
      'Smartphone Integration (Apple CarPlay/Android Auto)',
      'LED High Performance',
      'Keyless-Go',
      'Câmera de ré',
      'Sensores de estacionamento'
    ],
    marketingHighlights: [
      'Design esportivo e aerodinâmico',
      'Tecnologia MBUX com inteligência artificial',
      'Experiência premium acessível',
      'Perfeito equilíbrio entre luxo e eficiência'
    ],
    targetAudience: 'Jovens profissionais urbanos que buscam seu primeiro Mercedes-Benz premium, valorizando tecnologia e design moderno.'
  },
  {
    id: 'classe-c',
    name: 'Classe C Sedan',
    category: 'Sedan',
    year: 2024,
    priceRange: '€55.000 - €75.000',
    description: 'O sedan executivo mais vendido da Mercedes-Benz, combinando elegância e performance.',
    specs: {
      engine: '1.5L Turbo Hybrid / 2.0L Turbo',
      power: '204 - 258 CV',
      acceleration: '5.7 - 7.3s (0-100 km/h)',
      topSpeed: '246 - 250 km/h',
      fuelType: 'Gasolina Híbrido / Gasolina',
      transmission: '9G-TRONIC'
    },
    features: [
      'MBUX com telas duplas de 11.9" e 12.3"',
      'Realidade Aumentada na navegação',
      'Suspensão AGILITY CONTROL',
      'MULTIBEAM LED com tecnologia adaptativa',
      'Teto solar panorâmico',
      'Bancos elétricos com memória',
      'Sistema de som Burmester',
      'Ambient Lighting com 64 cores'
    ],
    marketingHighlights: [
      'Tecnologia de Classe S em formato compacto',
      'Motorização híbrida eficiente',
      'Interior luxuoso e tecnológico',
      'Referência no segmento executivo'
    ],
    targetAudience: 'Executivos e empresários que buscam prestígio, tecnologia avançada e conforto superior no dia a dia corporativo.'
  },
  {
    id: 'classe-e',
    name: 'Classe E Sedan',
    category: 'Sedan',
    year: 2024,
    priceRange: '€75.000 - €95.000',
    description: 'O sedan executivo premium que define o padrão de luxo e inovação tecnológica.',
    specs: {
      engine: '2.0L Turbo Hybrid / 3.0L Inline-6 Turbo Hybrid',
      power: '204 - 381 CV',
      acceleration: '5.2 - 6.6s (0-100 km/h)',
      topSpeed: '250 km/h (limitada)',
      fuelType: 'Gasolina Híbrido / Diesel Híbrido',
      transmission: '9G-TRONIC'
    },
    features: [
      'MBUX Hyperscreen (opcional) - 3 telas em 141cm',
      'Direção autônoma Nível 2',
      'Suspensão pneumática AIRMATIC',
      'Digital Light com projeção',
      'Bancos multicontorno com massagem',
      'Head-Up Display com Realidade Aumentada',
      'Sistema de som Burmester 4D',
      'PRE-SAFE Impulse Side'
    ],
    marketingHighlights: [
      'Máxima expressão de tecnologia e conforto',
      'Motorização híbrida de alta eficiência',
      'Segurança ativa e passiva incomparável',
      'Design sofisticado e atemporal'
    ],
    targetAudience: 'Alta direção empresarial e profissionais liberais de sucesso que exigem o máximo em tecnologia, segurança e prestígio.'
  },
  {
    id: 'classe-s',
    name: 'Classe S Sedan',
    category: 'Sedan',
    year: 2024,
    priceRange: '€120.000 - €180.000',
    description: 'O ápice do luxo automotivo. A berlina de luxo que define o futuro da mobilidade premium.',
    specs: {
      engine: '3.0L Inline-6 Turbo Hybrid / 4.0L V8 BiTurbo Hybrid',
      power: '367 - 503 CV',
      acceleration: '4.9 - 5.4s (0-100 km/h)',
      topSpeed: '250 km/h (limitada)',
      fuelType: 'Gasolina Híbrido',
      transmission: '9G-TRONIC'
    },
    features: [
      'MBUX Hyperscreen - 3 displays integrados',
      'Direção traseira até 10 graus',
      'Suspensão E-ACTIVE BODY CONTROL',
      'Bancos Executive com função recline',
      'Ambient Lighting com 263 LEDs',
      'Sistema de fragrância ENERGIZING',
      'Burmester High-End 4D Surround Sound',
      'Vidros duplos acústicos',
      'DRIVE PILOT - condução autônoma Nível 3 (em mercados selecionados)'
    ],
    marketingHighlights: [
      'O melhor carro do mundo',
      'Pioneiro em inovações automotivas',
      'Luxo absoluto em cada detalhe',
      'Experiência de condução incomparável'
    ],
    targetAudience: 'Elite empresarial, celebridades e indivíduos que buscam o absoluto em luxo, tecnologia e exclusividade automotiva.'
  },

  // SUV Category
  {
    id: 'gla',
    name: 'GLA SUV',
    category: 'SUV',
    year: 2024,
    priceRange: '€42.000 - €55.000',
    description: 'SUV compacto premium com design dinâmico e tecnologia de ponta.',
    specs: {
      engine: '1.3L Turbo / 2.0L Turbo',
      power: '163 - 224 CV',
      acceleration: '6.9 - 9.1s (0-100 km/h)',
      topSpeed: '205 - 240 km/h',
      fuelType: 'Gasolina',
      transmission: '7G-DCT / 8G-DCT'
    },
    features: [
      'MBUX com tela de 10.25"',
      'Controle de voz "Hey Mercedes"',
      'Câmera 360 graus',
      'Tração integral 4MATIC (versões selecionadas)',
      'Teto solar panorâmico',
      'Porta-malas de 435 litros',
      'DYNAMIC SELECT com 5 modos de condução',
      'Bancos esportivos'
    ],
    marketingHighlights: [
      'Design SUV coupé compacto',
      'Posição de direção elevada',
      'Versatilidade urbana e aventureira',
      'Tecnologia MBUX intuitiva'
    ],
    targetAudience: 'Jovens famílias e aventureiros urbanos que buscam versatilidade, tecnologia e o prestígio Mercedes-Benz em formato compacto.'
  },
  {
    id: 'glb',
    name: 'GLB SUV',
    category: 'SUV',
    year: 2024,
    priceRange: '€48.000 - €62.000',
    description: 'SUV de 7 lugares que combina praticidade familiar com luxo premium.',
    specs: {
      engine: '1.3L Turbo / 2.0L Turbo',
      power: '163 - 224 CV',
      acceleration: '7.0 - 9.1s (0-100 km/h)',
      topSpeed: '205 - 235 km/h',
      fuelType: 'Gasolina',
      transmission: '7G-DCT / 8G-DCT'
    },
    features: [
      'Configuração de 7 lugares',
      'Tração 4MATIC permanente',
      'MBUX com comando de voz',
      'Porta-malas de 570 litros (5 lugares)',
      'Bancos traseiros deslizantes',
      'Teto solar panorâmico elétrico',
      'Easy-Pack com abertura elétrica',
      'OFF-ROAD Engineering Package (opcional)'
    ],
    marketingHighlights: [
      'Único SUV compacto de 7 lugares premium',
      'Versatilidade incomparável',
      'Design robusto e aventureiro',
      'Conforto para toda a família'
    ],
    targetAudience: 'Famílias grandes que valorizam espaço, versatilidade e não abrem mão do luxo e tecnologia Mercedes-Benz.'
  },
  {
    id: 'glc',
    name: 'GLC SUV',
    category: 'SUV',
    year: 2024,
    priceRange: '€65.000 - €85.000',
    description: 'O SUV médio mais vendido da Mercedes-Benz, referência em elegância e tecnologia.',
    specs: {
      engine: '2.0L Turbo Hybrid',
      power: '204 - 258 CV',
      acceleration: '6.2 - 7.8s (0-100 km/h)',
      topSpeed: '222 - 240 km/h',
      fuelType: 'Gasolina Híbrido / Diesel Híbrido',
      transmission: '9G-TRONIC'
    },
    features: [
      'MBUX com telas de 11.9" e 12.3"',
      'Tração integral 4MATIC permanente',
      'Suspensão AGILITY CONTROL',
      'MULTIBEAM LED',
      'Bancos elétricos com memória',
      'Teto panorâmico deslizante',
      'Sistema de som surround',
      'Modo OFF-ROAD'
    ],
    marketingHighlights: [
      'Perfeito equilíbrio entre conforto e esportividade',
      'Motorização híbrida eficiente',
      'Design elegante e moderno',
      'Tecnologia de última geração'
    ],
    targetAudience: 'Profissionais de sucesso e famílias que buscam um SUV premium versátil para uso diário e viagens com máximo conforto.'
  },
  {
    id: 'gle',
    name: 'GLE SUV',
    category: 'SUV',
    year: 2024,
    priceRange: '€85.000 - €120.000',
    description: 'SUV de luxo de grande porte com tecnologia inovadora e conforto excepcional.',
    specs: {
      engine: '2.0L Turbo Hybrid / 3.0L Inline-6 Turbo Hybrid',
      power: '333 - 381 CV',
      acceleration: '5.7 - 6.9s (0-100 km/h)',
      topSpeed: '210 - 250 km/h',
      fuelType: 'Gasolina Híbrido / Diesel Híbrido',
      transmission: '9G-TRONIC'
    },
    features: [
      'MBUX com telas duplas widescreen',
      'E-ACTIVE BODY CONTROL (suspensão ativa)',
      'Bancos multicontorno com massagem',
      'Tração 4MATIC permanente',
      'OFF-ROAD Engineering Package',
      'Head-Up Display',
      'Burmester 3D Surround Sound',
      'Ambient Lighting de 64 cores',
      'Terceira fileira de bancos (opcional)'
    ],
    marketingHighlights: [
      'Suspensão E-ACTIVE revolucionária',
      'Espaço interno generoso',
      'Capacidade off-road surpreendente',
      'Luxo e tecnologia de Classe S'
    ],
    targetAudience: 'Executivos de alto nível e famílias exigentes que buscam máximo espaço, luxo, tecnologia e versatilidade em um SUV premium.'
  },
  {
    id: 'gls',
    name: 'GLS SUV',
    category: 'SUV',
    year: 2024,
    priceRange: '€110.000 - €150.000',
    description: 'A Classe S dos SUVs. Luxo absoluto com 7 lugares e tecnologia de ponta.',
    specs: {
      engine: '3.0L Inline-6 Turbo Hybrid / 4.0L V8 BiTurbo',
      power: '367 - 557 CV',
      acceleration: '4.9 - 6.3s (0-100 km/h)',
      topSpeed: '250 km/h (limitada)',
      fuelType: 'Gasolina Híbrido / Gasolina',
      transmission: '9G-TRONIC'
    },
    features: [
      '7 lugares com conforto executivo',
      'E-ACTIVE BODY CONTROL com função CURVE',
      'MBUX com MBUX Rear Tablet',
      'Bancos Executive na segunda fileira',
      'Climatização de 4 zonas',
      'Burmester High-End 3D Surround',
      'Head-Up Display de alta resolução',
      'Vidros duplos acústicos',
      'Capacidade de reboque de 3.500kg'
    ],
    marketingHighlights: [
      'O SUV mais luxuoso da Mercedes-Benz',
      'Conforto de primeira classe em 7 lugares',
      'Tecnologia E-ACTIVE BODY CONTROL única',
      'Presença imponente e exclusiva'
    ],
    targetAudience: 'Ultra high net worth individuals, grandes famílias de elite que exigem o máximo em luxo, espaço e tecnologia sem compromissos.'
  },

  // Coupé Category
  {
    id: 'classe-c-coupe',
    name: 'Classe C Coupé',
    category: 'Coupé',
    year: 2024,
    priceRange: '€60.000 - €80.000',
    description: 'Elegância esportiva em forma de coupé. Design sensual e performance envolvente.',
    specs: {
      engine: '2.0L Turbo',
      power: '204 - 258 CV',
      acceleration: '5.8 - 7.3s (0-100 km/h)',
      topSpeed: '250 km/h (limitada)',
      fuelType: 'Gasolina',
      transmission: '9G-TRONIC'
    },
    features: [
      'Design coupé de 2 portas',
      'MBUX com displays widescreen',
      'Teto panorâmico fixo',
      'Bancos esportivos',
      'Suspensão esportiva rebaixada',
      'DYNAMIC SELECT',
      'Iluminação LED High Performance',
      'Spoiler traseiro aerodinâmico'
    ],
    marketingHighlights: [
      'Design sensual e aerodinâmico',
      'Performance esportiva refinada',
      'Exclusividade de coupé premium',
      'Perfeito para quem valoriza estilo'
    ],
    targetAudience: 'Entusiastas automotivos e profissionais bem-sucedidos que buscam exclusividade, design marcante e prazer ao volante.'
  },
  {
    id: 'classe-e-coupe',
    name: 'Classe E Coupé',
    category: 'Coupé',
    year: 2024,
    priceRange: '€80.000 - €100.000',
    description: 'A perfeita fusão entre luxo executivo e design esportivo de coupé.',
    specs: {
      engine: '2.0L Turbo / 3.0L Inline-6 Turbo',
      power: '204 - 429 CV',
      acceleration: '4.6 - 6.6s (0-100 km/h)',
      topSpeed: '250 km/h (limitada)',
      fuelType: 'Gasolina',
      transmission: '9G-TRONIC'
    },
    features: [
      'Linhas de coupé elegantes',
      'Interior luxuoso de 4 lugares',
      'MULTIBEAM LED adaptativo',
      'Bancos multicontorno esportivos',
      'Sistema de som Burmester',
      'Teto panorâmico deslizante',
      'AIR BODY CONTROL (opcional)',
      'Capota de tecido conversível (Cabriolet)'
    ],
    marketingHighlights: [
      'Elegância e esportividade em harmonia',
      'Luxo executivo em formato coupé',
      'Design atemporal e sofisticado',
      'Performance de alto nível'
    ],
    targetAudience: 'Executivos e profissionais liberais de sucesso que desejam combinar prestígio, luxo e uma dose de emoção esportiva.'
  },

  // AMG Category
  {
    id: 'amg-c63',
    name: 'Mercedes-AMG C 63 S E PERFORMANCE',
    category: 'AMG',
    year: 2024,
    priceRange: '€140.000 - €160.000',
    description: 'Performance híbrida de 680 CV. O futuro das berlinas esportivas da AMG.',
    specs: {
      engine: '2.0L Turbo + Motor elétrico',
      power: '680 CV',
      acceleration: '3.4s (0-100 km/h)',
      topSpeed: '280 km/h (limitada)',
      fuelType: 'Gasolina Híbrido Plug-in',
      transmission: '9G-SPEEDSHIFT MCT'
    },
    features: [
      'Tração integral 4MATIC+ Performance',
      'AMG DYNAMIC SELECT com 8 modos',
      'Suspensão AMG RIDE CONTROL+',
      'Sistema de freios AMG cerâmica (opcional)',
      'AMG Performance 4MATIC+',
      'Bancos AMG Performance',
      'AMG Track Pace',
      'Escape AMG Performance com som característico',
      'Drift Mode'
    ],
    marketingHighlights: [
      '680 CV de pura performance híbrida',
      'Aceleração de superesportivo',
      'Tecnologia F1 aplicada às ruas',
      'O AMG mais poderoso da categoria'
    ],
    targetAudience: 'Entusiastas de alta performance que buscam tecnologia híbrida de ponta com performance de superesportivo no formato sedan.'
  },
  {
    id: 'amg-e53',
    name: 'Mercedes-AMG E 53 4MATIC+',
    category: 'AMG',
    year: 2024,
    priceRange: '€95.000 - €115.000',
    description: 'Performance híbrida refinada com luxo executivo. O equilíbrio perfeito entre conforto e esportividade.',
    specs: {
      engine: '3.0L Inline-6 Turbo + EQ Boost',
      power: '435 CV',
      acceleration: '4.5s (0-100 km/h)',
      topSpeed: '250 km/h (limitada)',
      fuelType: 'Gasolina Híbrido',
      transmission: '9G-SPEEDSHIFT TCT'
    },
    features: [
      'EQ Boost com 22 CV adicionais',
      'AMG 4MATIC+ com torque vetorial',
      'Suspensão pneumática AMG RIDE CONTROL',
      'AMG DYNAMIC SELECT',
      'Bancos AMG esportivos',
      'Volante AMG Performance',
      'Sistema de som Burmester 3D',
      'AMG Night Package'
    ],
    marketingHighlights: [
      'Performance híbrida refinada',
      'Luxo executivo com DNA esportivo',
      'Motor 6 cilindros com tecnologia EQ Boost',
      'Versatilidade para uso diário e pista'
    ],
    targetAudience: 'Executivos esportivos que buscam performance excepcional sem abrir mão do conforto e luxo para uso diário.'
  },
  {
    id: 'amg-gt',
    name: 'Mercedes-AMG GT 63 S E PERFORMANCE',
    category: 'AMG',
    year: 2024,
    priceRange: '€200.000 - €230.000',
    description: 'O superesportivo de 4 portas mais poderoso do mundo. 843 CV de tecnologia F1.',
    specs: {
      engine: '4.0L V8 BiTurbo + Motor elétrico',
      power: '843 CV',
      acceleration: '2.9s (0-100 km/h)',
      topSpeed: '316 km/h',
      fuelType: 'Gasolina Híbrido Plug-in',
      transmission: '9G-SPEEDSHIFT MCT'
    },
    features: [
      'AMG Performance 4MATIC+',
      'Suspensão ativa AMG ACTIVE RIDE CONTROL',
      'Freios cerâmicos AMG de série',
      'AMG Track Pace com telemetria',
      'Bancos AMG Performance com aquecimento',
      'Escape AMG Performance com som ajustável',
      'Aerodinâmica ativa',
      'Drift Mode e Race Start',
      'Bateria de 6.1 kWh para modo elétrico'
    ],
    marketingHighlights: [
      '843 CV - o AMG de 4 portas mais potente',
      'Tecnologia direta da Fórmula 1',
      'De 0 a 100 km/h em 2.9 segundos',
      'Luxo e performance em níveis extremos'
    ],
    targetAudience: 'Colecionadores e entusiastas de alta performance que buscam o ápice da engenharia automotiva em um superesportivo utilizável no dia a dia.'
  },
  {
    id: 'amg-gle-63',
    name: 'Mercedes-AMG GLE 63 S 4MATIC+',
    category: 'AMG',
    year: 2024,
    priceRange: '€135.000 - €155.000',
    description: 'SUV de alta performance com 612 CV. Versatilidade extrema com performance de superesportivo.',
    specs: {
      engine: '4.0L V8 BiTurbo',
      power: '612 CV',
      acceleration: '3.8s (0-100 km/h)',
      topSpeed: '280 km/h (limitada)',
      fuelType: 'Gasolina',
      transmission: '9G-SPEEDSHIFT TCT'
    },
    features: [
      'AMG Performance 4MATIC+',
      'Suspensão pneumática AMG RIDE CONTROL+',
      'AMG DYNAMIC SELECT com Race Mode',
      'Sistema de escape AMG Performance',
      'Freios AMG de alto desempenho',
      'Bancos AMG Performance',
      'AMG Track Pace',
      'Capacidade off-road preservada',
      'Race Start function'
    ],
    marketingHighlights: [
      'O SUV mais rápido da categoria',
      '612 CV em um SUV de luxo',
      'Performance sem comprometer versatilidade',
      'Som inconfundível do V8 AMG'
    ],
    targetAudience: 'Entusiastas que não aceitam escolher entre performance extrema e praticidade de SUV, exigindo o máximo em ambos.'
  },

  // EQ Electric Category
  {
    id: 'eqa',
    name: 'Mercedes-EQ EQA',
    category: 'EQ',
    year: 2024,
    priceRange: '€52.000 - €65.000',
    description: 'SUV compacto 100% elétrico. A porta de entrada para a mobilidade elétrica premium.',
    specs: {
      engine: 'Motor elétrico',
      power: '190 - 292 CV',
      acceleration: '5.6 - 9.0s (0-100 km/h)',
      topSpeed: '160 km/h (limitada)',
      fuelType: '100% Elétrico',
      transmission: 'Transmissão direta'
    },
    features: [
      'Bateria de 66.5 kWh',
      'Autonomia de até 560 km (WLTP)',
      'Carregamento rápido DC até 100 kW',
      'Tração 4MATIC (versões AWD)',
      'MBUX com funções EQ específicas',
      'Pré-climatização remota',
      'Recuperação de energia em 3 níveis',
      'Electric Art - design exclusivo EQ',
      'Navigation with Electric Intelligence'
    ],
    marketingHighlights: [
      'Mobilidade 100% elétrica acessível',
      'Autonomia de até 560 km',
      'Tecnologia EQ da Mercedes-Benz',
      'Zero emissões, máximo conforto'
    ],
    targetAudience: 'Profissionais urbanos eco-conscientes que buscam sua primeira experiência com veículo elétrico premium sem comprometer qualidade.'
  },
  {
    id: 'eqb',
    name: 'Mercedes-EQ EQB',
    category: 'EQ',
    year: 2024,
    priceRange: '€58.000 - €72.000',
    description: 'SUV elétrico de 7 lugares. Versatilidade familiar com zero emissões.',
    specs: {
      engine: 'Motor elétrico',
      power: '228 - 292 CV',
      acceleration: '6.2 - 8.9s (0-100 km/h)',
      topSpeed: '160 km/h (limitada)',
      fuelType: '100% Elétrico',
      transmission: 'Transmissão direta'
    },
    features: [
      'Configuração de até 7 lugares',
      'Bateria de 66.5 kWh',
      'Autonomia de até 535 km (WLTP)',
      'Carregamento DC até 100 kW',
      'Tração 4MATIC elétrica',
      'MBUX com EQ specific functions',
      'Recuperação de energia adaptativa',
      'Pré-condicionamento da bateria',
      'Mercedes me Charge'
    ],
    marketingHighlights: [
      'Único SUV elétrico compacto de 7 lugares',
      'Zero emissões para toda a família',
      'Autonomia excepcional de 535 km',
      'Tecnologia EQ de ponta'
    ],
    targetAudience: 'Famílias modernas e eco-conscientes que precisam de espaço para 7 passageiros sem emissões e com tecnologia premium.'
  },
  {
    id: 'eqe',
    name: 'Mercedes-EQ EQE',
    category: 'EQ',
    year: 2024,
    priceRange: '€85.000 - €110.000',
    description: 'Sedan elétrico executivo com arquitetura dedicada. O futuro da mobilidade executiva.',
    specs: {
      engine: 'Motor elétrico',
      power: '292 - 625 CV (AMG)',
      acceleration: '3.3 - 6.4s (0-100 km/h)',
      topSpeed: '210 - 240 km/h (limitada)',
      fuelType: '100% Elétrico',
      transmission: 'Transmissão direta'
    },
    features: [
      'Plataforma EVA2 dedicada para elétricos',
      'Bateria de 90.6 kWh',
      'Autonomia de até 654 km (WLTP)',
      'Carregamento rápido DC até 170 kW',
      'MBUX Hyperscreen (opcional)',
      'Suspensão traseira multi-link',
      'Direção traseira até 10 graus',
      'Over-the-air updates',
      'Sound Experience artificial',
      'Versão AMG EQE 53 disponível'
    ],
    marketingHighlights: [
      'Arquitetura 100% elétrica desde o projeto',
      'Autonomia de mais de 650 km',
      'Tecnologia MBUX Hyperscreen',
      'Silêncio e conforto incomparáveis'
    ],
    targetAudience: 'Executivos visionários que buscam mobilidade elétrica premium sem compromissos, com máxima autonomia e tecnologia.'
  },
  {
    id: 'eqe-suv',
    name: 'Mercedes-EQ EQE SUV',
    category: 'EQ',
    year: 2024,
    priceRange: '€95.000 - €120.000',
    description: 'SUV elétrico executivo. Espaço, luxo e performance elétrica em formato SUV.',
    specs: {
      engine: 'Motor elétrico',
      power: '292 - 625 CV (AMG)',
      acceleration: '3.5 - 6.6s (0-100 km/h)',
      topSpeed: '210 - 240 km/h (limitada)',
      fuelType: '100% Elétrico',
      transmission: 'Transmissão direta'
    },
    features: [
      'Plataforma EVA2',
      'Bateria de 90.6 kWh',
      'Autonomia de até 590 km (WLTP)',
      'Tração 4MATIC elétrica',
      'Carregamento DC até 170 kW',
      'MBUX Hyperscreen disponível',
      'Suspensão pneumática AIRMATIC',
      'Direção traseira',
      'OFF-ROAD mode',
      'AMG EQE 53 SUV disponível'
    ],
    marketingHighlights: [
      'SUV elétrico executivo versátil',
      'Performance elétrica em formato familiar',
      'Tecnologia de ponta Mercedes-EQ',
      'Conforto e sustentabilidade'
    ],
    targetAudience: 'Famílias executivas eco-conscientes que buscam espaço de SUV, luxo Mercedes e mobilidade 100% elétrica de longo alcance.'
  },
  {
    id: 'eqs',
    name: 'Mercedes-EQ EQS',
    category: 'EQ',
    year: 2024,
    priceRange: '€120.000 - €160.000',
    description: 'O ápice da mobilidade elétrica de luxo. A Classe S elétrica que redefine o futuro automotivo.',
    specs: {
      engine: 'Motor elétrico',
      power: '333 - 658 CV (AMG)',
      acceleration: '3.4 - 6.2s (0-100 km/h)',
      topSpeed: '210 - 250 km/h (limitada)',
      fuelType: '100% Elétrico',
      transmission: 'Transmissão direta'
    },
    features: [
      'MBUX Hyperscreen de série (141 cm)',
      'Bateria de 107.8 kWh',
      'Autonomia de até 782 km (WLTP)',
      'Carregamento ultra-rápido DC até 200 kW',
      'Suspensão AIRMATIC adaptativa',
      'Direção traseira até 10 graus',
      'Coeficiente aerodinâmico de 0.20 Cd',
      'Bancos Executive com massagem',
      'Burmester High-End 4D',
      'ENERGIZING Comfort',
      'Versão AMG EQS 53 disponível'
    ],
    marketingHighlights: [
      'Autonomia recorde de 782 km',
      'O carro de produção mais aerodinâmico',
      'MBUX Hyperscreen revolucionário',
      'Luxo elétrico sem precedentes'
    ],
    targetAudience: 'Elite empresarial e early adopters de tecnologia que buscam o absoluto em luxo, tecnologia e sustentabilidade automotiva.'
  },
  {
    id: 'eqs-suv',
    name: 'Mercedes-EQ EQS SUV',
    category: 'EQ',
    year: 2024,
    priceRange: '€130.000 - €170.000',
    description: 'SUV elétrico de luxo definitivo. Espaço para 7 com tecnologia EQ de ponta.',
    specs: {
      engine: 'Motor elétrico',
      power: '360 - 658 CV (AMG)',
      acceleration: '3.4 - 6.0s (0-100 km/h)',
      topSpeed: '210 - 250 km/h (limitada)',
      fuelType: '100% Elétrico',
      transmission: 'Transmissão direta'
    },
    features: [
      'Configuração de até 7 lugares',
      'MBUX Hyperscreen de série',
      'Bateria de 108.4 kWh',
      'Autonomia de até 660 km (WLTP)',
      'Carregamento DC até 200 kW',
      'Suspensão pneumática AIRMATIC',
      'E-ACTIVE BODY CONTROL (opcional)',
      'Tração 4MATIC elétrica',
      'Terceira fileira elétrica',
      'AMG EQS 53 SUV disponível',
      'OFF-ROAD package'
    ],
    marketingHighlights: [
      'O SUV elétrico mais luxuoso',
      'Até 7 lugares com luxo de Classe S',
      'Autonomia de 660 km',
      'Tecnologia E-ACTIVE disponível'
    ],
    targetAudience: 'Famílias de ultra high net worth que exigem máximo espaço, luxo absoluto e mobilidade 100% elétrica sem qualquer compromisso.'
  }
];

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedSpecs, setExpandedSpecs] = useState<string | null>(null);

  // Filter models based on selected category and search query
  const filteredModels = useMemo(() => {
    let models = mercedesModels;

    // Filter by category
    if (selectedCategory !== 'all') {
      models = models.filter(model => model.category === selectedCategory);
    }

    // Filter by search query
    if (query) {
      const searchLower = query.toLowerCase();
      models = models.filter(model =>
        model.name.toLowerCase().includes(searchLower) ||
        model.description.toLowerCase().includes(searchLower) ||
        model.features.some(f => f.toLowerCase().includes(searchLower)) ||
        model.marketingHighlights.some(h => h.toLowerCase().includes(searchLower))
      );
    }

    return models;
  }, [selectedCategory, query]);

  const handleAISearch = async () => {
    setLoading(true);
    setSearchResult('');
    try {
      const response = await fetch('/api/ai/search-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResult(data.answer);
      } else {
        setSearchResult('Erro ao buscar informações. Tente novamente.');
      }
    } catch (error) {
      setSearchResult('Erro ao conectar com o serviço de busca.');
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = (model: VehicleModel) => {
    setSelectedModel(model);
    setDialogOpen(true);
  };

  const toggleSpecs = (modelId: string) => {
    setExpandedSpecs(expandedSpecs === modelId ? null : modelId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sedan': return Car;
      case 'SUV': return Shield;
      case 'Coupé': return Sparkles;
      case 'AMG': return Gauge;
      case 'EQ': return Zap;
      default: return Car;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sedan': return 'text-midnight';
      case 'SUV': return 'text-arrow';
      case 'Coupé': return 'text-purple-600';
      case 'AMG': return 'text-amg';
      case 'EQ': return 'text-green-600';
      default: return 'text-midnight';
    }
  };

  const categoryCount = (cat: string) => {
    if (cat === 'all') return mercedesModels.length;
    return mercedesModels.filter(m => m.category === cat).length;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-midnight">
          Base de Conhecimento Mercedes-Benz
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Catálogo completo de modelos, especificações e informações técnicas
        </p>
      </div>

      {/* AI Search Section */}
      <Card className="border-2 border-midnight/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amg" />
            Busca Inteligente com IA
          </CardTitle>
          <CardDescription>
            Faça perguntas sobre qualquer modelo Mercedes-Benz e receba respostas detalhadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ex: Qual é o Mercedes mais rápido? Diferenças entre EQE e EQS?"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              />
            </div>
            <Button
              className="bg-amg hover:bg-amg/90 text-white"
              onClick={handleAISearch}
              disabled={loading || !query}
            >
              {loading ? 'Buscando...' : 'Buscar com IA'}
            </Button>
          </div>

          {searchResult && (
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-2">Resposta da IA</h4>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{searchResult}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="all" className="flex flex-col gap-1 py-3">
            <Car className="h-4 w-4" />
            <span className="text-xs">Todos ({categoryCount('all')})</span>
          </TabsTrigger>
          <TabsTrigger value="Sedan" className="flex flex-col gap-1 py-3">
            <Car className="h-4 w-4" />
            <span className="text-xs">Sedan ({categoryCount('Sedan')})</span>
          </TabsTrigger>
          <TabsTrigger value="SUV" className="flex flex-col gap-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">SUV ({categoryCount('SUV')})</span>
          </TabsTrigger>
          <TabsTrigger value="Coupé" className="flex flex-col gap-1 py-3">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs">Coupé ({categoryCount('Coupé')})</span>
          </TabsTrigger>
          <TabsTrigger value="AMG" className="flex flex-col gap-1 py-3">
            <Gauge className="h-4 w-4" />
            <span className="text-xs">AMG ({categoryCount('AMG')})</span>
          </TabsTrigger>
          <TabsTrigger value="EQ" className="flex flex-col gap-1 py-3">
            <Zap className="h-4 w-4" />
            <span className="text-xs">EQ ({categoryCount('EQ')})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredModels.length === 0 ? (
            <Card className="border-2">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum modelo encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar sua busca ou selecionar outra categoria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredModels.map((model) => {
                const Icon = getCategoryIcon(model.category);
                const isExpanded = expandedSpecs === model.id;

                return (
                  <Card
                    key={model.id}
                    className="border-2 hover:border-amg transition-all duration-300 hover:shadow-lg cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg bg-slate-100 ${getCategoryColor(model.category)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {model.year}
                          </div>
                          <div className="text-sm font-semibold text-amg flex items-center gap-1 mt-1">
                            <Euro className="h-3 w-3" />
                            {model.priceRange}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{model.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {model.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Quick Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Gauge className="h-3 w-3" />
                          <span>{model.specs.power}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>{model.specs.acceleration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                          <Fuel className="h-3 w-3" />
                          <span>{model.specs.fuelType}</span>
                        </div>
                      </div>

                      {/* Expandable Specs */}
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => toggleSpecs(model.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Ocultar Especificações
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Ver Especificações Completas
                            </>
                          )}
                        </Button>

                        {isExpanded && (
                          <div className="mt-4 space-y-3 text-sm border-t pt-4">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Settings className="h-4 w-4 text-midnight" />
                                Especificações Técnicas
                              </h4>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <p><span className="font-medium">Motor:</span> {model.specs.engine}</p>
                                <p><span className="font-medium">Potência:</span> {model.specs.power}</p>
                                <p><span className="font-medium">0-100 km/h:</span> {model.specs.acceleration}</p>
                                <p><span className="font-medium">Vel. Máxima:</span> {model.specs.topSpeed}</p>
                                <p><span className="font-medium">Transmissão:</span> {model.specs.transmission}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-midnight" />
                                Público-Alvo
                              </h4>
                              <p className="text-xs text-muted-foreground">{model.targetAudience}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full bg-midnight hover:bg-midnight/90 text-white"
                        onClick={() => handleModelClick(model)}
                      >
                        Ver Detalhes Completos
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Model Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedModel && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl mb-2">{selectedModel.name}</DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedModel.description}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-sm font-semibold">
                      {selectedModel.category}
                    </div>
                    <div className="text-xl font-bold text-amg mt-2">
                      {selectedModel.priceRange}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Specs Grid */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-midnight" />
                    Especificações Técnicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Motor</p>
                      <p className="font-semibold">{selectedModel.specs.engine}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potência</p>
                      <p className="font-semibold">{selectedModel.specs.power}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aceleração 0-100 km/h</p>
                      <p className="font-semibold">{selectedModel.specs.acceleration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Velocidade Máxima</p>
                      <p className="font-semibold">{selectedModel.specs.topSpeed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Combustível</p>
                      <p className="font-semibold">{selectedModel.specs.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transmissão</p>
                      <p className="font-semibold">{selectedModel.specs.transmission}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-midnight" />
                    Equipamentos e Tecnologias
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedModel.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-amg mt-1.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketing Highlights */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-midnight" />
                    Destaques de Marketing
                  </h3>
                  <div className="space-y-2">
                    {selectedModel.marketingHighlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-green-900">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-midnight" />
                    Público-Alvo
                  </h3>
                  <p className="text-sm p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-900">
                    {selectedModel.targetAudience}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
