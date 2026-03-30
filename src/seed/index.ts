import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const gpusData = [
  {
    name: 'MSI GeForce RTX 4070 SUPER Gaming X Slim',
    brand: 'nvidia',
    price: 78000,
    stock_quantity: 8,
    length_mm: 307,
    recommended_psu_w: 650,
    pin_8_connectors: 0,
    has_16pin_connector: true, // Серия 4070 Super использует новый 16-pin (12VHPWR)
    description:
      'Мощная видеокарта для игры в 2K разрешении на ультра-настройках. Тонкое исполнение Slim позволит установить её в большинство корпусов.',
  },
  {
    name: 'ASUS ROG Strix GeForce RTX 4090 OC',
    brand: 'nvidia',
    price: 240000,
    stock_quantity: 3,
    length_mm: 358, // Настоящий гигант!
    recommended_psu_w: 850,
    pin_8_connectors: 0,
    has_16pin_connector: true,
    description:
      'Ультимативный флагман для 4K гейминга и тяжелых рабочих задач. Топовое охлаждение ROG Strix и экстремальный заводской разгон.',
  },
  {
    name: 'Sapphire AMD Radeon RX 7700 XT Pulse',
    brand: 'amd', // Если в админке Select, поправь регистр при необходимости
    price: 54000,
    stock_quantity: 10,
    length_mm: 280,
    recommended_psu_w: 700,
    pin_8_connectors: 2, // Требует два классических 8-pin кабеля
    has_16pin_connector: false,
    description:
      'Сбалансированная видеокарта от AMD для комфортного гейминга в разрешении 1440p. Фирменная надежность серии Pulse.',
  },
  {
    name: 'PowerColor AMD Radeon RX 7900 XTX Hellhound',
    brand: 'amd',
    price: 115000,
    stock_quantity: 5,
    length_mm: 320,
    recommended_psu_w: 800,
    pin_8_connectors: 2,
    has_16pin_connector: false,
    description:
      'Флагманское решение от AMD с внушительным объемом видеопамяти 24 ГБ. Идеально подходит для игр в высоком разрешении и стриминга.',
  },
] as const
