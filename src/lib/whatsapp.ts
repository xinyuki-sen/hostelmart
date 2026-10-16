// ====================================================================
// HOSTELMART WHATSAPP DIRECT-CONNECT BRIDGE
// Secure deep link generation with pre-filled deal negotiations
// ====================================================================

export function normalizePhoneNumber(phone: string, defaultCountryCode: string = '91'): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  // Strip leading zeroes (common in Indian mobile numbers like 09876543210)
  cleaned = cleaned.replace(/^0+/, '');
  if (cleaned.startsWith(defaultCountryCode) && cleaned.length > 10) {
    return cleaned;
  }
  return `${defaultCountryCode}${cleaned}`;
}

interface BuildWhatsAppLinkParams {
  phone: string;
  title: string;
  price: number;
  isNegotiable?: boolean;
  hostelBlock?: string;
  roomNumber?: string;
}

export function buildWhatsAppLink({
  phone,
  title,
  price,
  isNegotiable = false,
  hostelBlock = '',
  roomNumber = ''
}: BuildWhatsAppLinkParams): string {
  const fullNumber = normalizePhoneNumber(phone);
  if (!fullNumber) return '#';

  const isFree = price === 0;
  const greeting = "Hey! I saw your listing on HostelMart.";
  const itemLine = `📦 *${title}*`;
  const priceLine = isFree
    ? "💰 Listed as: *FREE Giveaway (Hostel Karma)* 🎁"
    : `💰 Listed Price: *₹${price}* (${isNegotiable ? 'Negotiable' : 'Fixed Price'})`;
    
  const locationLine = hostelBlock && roomNumber 
    ? `📍 Pickup Location: ${hostelBlock}, Room ${roomNumber}` 
    : '';

  const callToAction = isFree
    ? "I'd love to pick this up! When are you free in your room today?"
    : isNegotiable
      ? "I'm interested in this item. Are you open to negotiating the price? Let me know when you're free in your room so I can check it out!"
      : "I would like to purchase this at the listed price. When are you free in your room for pickup?";

  const message = [
    greeting,
    "",
    itemLine,
    priceLine,
    ...(locationLine ? [locationLine] : []),
    "",
    callToAction
  ].join('\n');

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}
