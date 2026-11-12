import { useState } from 'react';
import { Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { Card } from '../components/UI';

const TOPICS = [
  {
    title: 'How the menstrual cycle works',
    body:
      'The cycle is counted from the first day of one period to the day before the next one starts. In most adults it lasts between 21 and 35 days, and bleeding usually lasts 2 to 7 days. Hormones control the cycle and prepare the body for a possible pregnancy each month.',
  },
  {
    title: 'The four phases',
    body:
      'Menstrual phase: the lining of the uterus is shed as your period.\n\nFollicular phase: the body prepares an egg and the uterus lining begins to rebuild.\n\nOvulation: an egg is released, usually around the middle of the cycle.\n\nLuteal phase: the body prepares for pregnancy. If there is none, hormone levels drop and the next period begins.',
  },
  {
    title: 'Common symptoms',
    body:
      'Many people notice cramps, bloating, tiredness, headaches, acne, breast tenderness, food cravings and mood changes before or during their period. Symptoms vary from person to person and from cycle to cycle. Tracking them in the Daily Log helps you see your own pattern.',
  },
  {
    title: 'Easing period pain',
    body:
      'A heat pad or warm bath, gentle exercise such as walking or stretching, rest and drinking enough water can all help. Over-the-counter pain relief can help too: follow the instructions on the label and ask a pharmacist if you are unsure what is safe for you.',
  },
  {
    title: 'Hygiene during your period',
    body:
      'Change pads or tampons regularly, at least every 4 to 8 hours, and wash your hands before and after. Wash the outside of the genital area with plain water or mild unscented soap. Avoid scented products and douching. Menstrual cups and period underwear are other options.',
  },
  {
    title: 'Food, sleep and exercise',
    body:
      'You lose some iron when you bleed, so iron-rich foods such as leafy greens, beans, lentils, eggs and lean meat can help. Regular sleep, water and moderate exercise often reduce cramps and low mood. Do what feels comfortable for you.',
  },
  {
    title: 'When to see a doctor',
    body:
      'Speak to a doctor or nurse if:\n• your periods stop for 3 months or more and you are not pregnant\n• your cycles are often shorter than 21 days or longer than 35 days\n• bleeding lasts more than 7 days\n• you soak through a pad or tampon every hour for several hours\n• pain is severe and stops you from doing normal activities\n• you bleed between periods or after sex\n\nIf you feel suddenly very unwell with a fever while using a tampon, remove it and get medical help right away.',
  },
];

export default function EducationScreen() {
  const [open, setOpen] = useState(0);

  return (
    <ScrollView contentContainerStyle={s.container}>
      {TOPICS.map((t, i) => (
        <Pressable key={t.title} onPress={() => setOpen(open === i ? null : i)}>
          <Card>
            <Text style={s.title}>
              {open === i ? '▾  ' : '▸  '}
              {t.title}
            </Text>
            {open === i && <Text style={s.body}>{t.body}</Text>}
          </Card>
        </Pressable>
      ))}
      <Text style={s.disclaimer}>
        This information is for education only and does not replace advice from a health professional.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { marginTop: 10, color: colors.text, fontSize: 14, lineHeight: 21 },
  disclaimer: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 6 },
});
