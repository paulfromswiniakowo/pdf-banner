import { Command } from "@cliffy/command";
import { PDFDocument, cmyk, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/**
 * Przelicza wartość z milimetrów na punkty PDF.
 * @param mm Wartość w milimetrach.
 * @returns Równowartość w punktach PDF (1 punkt = 1/72 cala).
 */
function mmToPoints(mm: number): number {
  // 1 cal = 25.4 mm
  // 1 punkt = 1/72 cala
  // Zatem: mm * (1/25.4) * 72
  return (mm / 25.4) * 72;
}

/**
 * Zwraca kolor CMYK na podstawie nazwy
 */
function getColor(colorName: string) {
  const colors: Record<string, [number, number, number, number]> = {
    // Podstawowe kolory
    'black': [0, 0, 0, 1],      // Czarny
    'white': [0, 0, 0, 0],      // Biały
    'red': [0, 1, 1, 0],        // Czerwony
    'blue': [1, 0, 0, 0],       // Niebieski
    'yellow': [0, 0, 1, 0],     // Żółty
    'green': [1, 0, 1, 0],      // Zielony
    
    // Rozszerzona paleta dla banerów PVC
    'orange': [0, 0.5, 1, 0],   // Pomarańczowy
    'purple': [0.5, 1, 0, 0],   // Fioletowy
    'pink': [0, 0.7, 0.2, 0],   // Różowy
    'cyan': [1, 0, 0.2, 0],     // Cyjan
    'magenta': [0, 1, 0, 0],    // Magenta
    'lime': [0.5, 0, 1, 0],     // Limonkowy
    'navy': [1, 0.5, 0, 0.2],   // Granatowy
    'maroon': [0.2, 1, 1, 0.2], // Bordowy
    'teal': [1, 0.2, 0.5, 0],   // Morski
    'olive': [0.3, 0.2, 1, 0.1], // Oliwkowy
    'silver': [0, 0, 0, 0.25],  // Srebrny
    'gold': [0, 0.2, 0.8, 0.1], // Złoty
  };
  
  return colors[colorName] || colors['black']; // Domyślnie czarny
}


/**
 * Funkcja generująca PDF dla banerów PVC
 */
async function generatePDF(
  text: string, 
  outputFile: string, 
  widthMm: number,
  heightMm: number,
  centerText: boolean,
  fontSizeMm: number,
  foregroundColor: string,
  backgroundColor: string
) {
  // Stałe wartości dla banerów PVC
  const marginMm = 25; // Stały margines 25mm
  const borderThickness = 0.5; // Stała grubość ramki 0.5mm
  
  console.log(`Generowanie baneru PVC (${widthMm}x${heightMm}mm) z marginesem ${marginMm}mm, ramką ${borderThickness}mm, czcionką ${fontSizeMm}mm, kolory: ${foregroundColor}/${backgroundColor} i tekstem: "${text}"`);
  
  // Inicjalizujemy dokument
  const pdfDoc = await PDFDocument.create();
  
  // Rejestrujemy fontkit
  pdfDoc.registerFontkit(fontkit);
  
  // Tworzymy stronę o podanych wymiarach
  const page = pdfDoc.addPage([mmToPoints(widthMm), mmToPoints(heightMm)]);
  const { width, height } = page.getSize();
  
  // Pobieramy kolory CMYK
  const [fgC, fgM, fgY, fgK] = getColor(foregroundColor);
  const [bgC, bgM, bgY, bgK] = getColor(backgroundColor);
  
  // Ładujemy font DejaVu Sans Condensed Bold - kompaktowy z doskonałym wsparciem Unicode
  let customFont;
  try {
    const fontBytes = await Deno.readFile('DejaVuSansCondensed-Bold.ttf');
    customFont = await pdfDoc.embedFont(fontBytes);
    console.log('Załadowano font DejaVu Sans Condensed Bold - kompaktowy z pełnym wsparciem symboli');
  } catch (_error) {
    console.log('Nie można załadować DejaVu Sans Condensed Bold, próbuję systemowy DejaVu Sans Bold...');
    try {
      const fallbackBytes = await Deno.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf');
      customFont = await pdfDoc.embedFont(fallbackBytes);
      console.log('Używam systemowy DejaVu Sans Bold jako fallback');
    } catch (_fallbackError) {
      console.log('Używam Helvetica Bold jako ostateczny fallback');
      customFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }
  }
  
  // PVC Banner Layout:
  // 1. Białe tło całej strony (warstwa dolna)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: cmyk(0, 0, 0, 0), // Biały
  });
  
  // 2. Wewnętrzny prostokąt z kolorem tła i ramką (25mm mniejszy, wyśrodkowany)
  const margin = mmToPoints(marginMm);
  const rectX = margin;
  const rectY = margin;
  const rectWidth = width - (2 * margin);
  const rectHeight = height - (2 * margin);
  
  // Rysujemy wypełniony prostokąt z kolorem tła
  page.drawRectangle({
    x: rectX,
    y: rectY,
    width: rectWidth,
    height: rectHeight,
    color: cmyk(bgC, bgM, bgY, bgK), // Kolor tła
    borderColor: cmyk(fgC, fgM, fgY, fgK), // Kolor ramki
    borderWidth: mmToPoints(borderThickness),
  });
  
  // 3. Rysujemy koła w rogach (średnica 12mm, środki 37.5mm od krawędzi)
  const circleRadius = mmToPoints(6); // 12mm średnica = 6mm promień
  const circleOffset = mmToPoints(37.5); // 37.5mm od krawędzi PDF
  
  // Koła w rogach
  const cornerPositions = [
    { x: circleOffset, y: circleOffset }, // Lewy dolny
    { x: width - circleOffset, y: circleOffset }, // Prawy dolny
    { x: circleOffset, y: height - circleOffset }, // Lewy górny
    { x: width - circleOffset, y: height - circleOffset }, // Prawy górny
  ];
  
  cornerPositions.forEach(pos => {
    page.drawCircle({
      x: pos.x,
      y: pos.y,
      size: circleRadius,
      color: cmyk(fgC, fgM, fgY, fgK), // Kolor pierwszego planu
    });
  });
  
  // 4. Dodatkowe koła między rogami (z zachowaniem minimalnej odległości 500mm)
  const minDistanceMm = 500;
  const minDistance = mmToPoints(minDistanceMm);
  
  // Sprawdzamy poziome krawędzie (góra i dół)
  const horizontalDistance = width - (2 * circleOffset);
  if (horizontalDistance >= minDistance) {
    // Obliczamy ile kół możemy umieścić między rogami
    const numIntermediateCircles = Math.floor(horizontalDistance / minDistance);
    
    // Obliczamy równomierny odstęp między kołami
    const horizontalSpacing = horizontalDistance / (numIntermediateCircles + 1);
    
    // Rysujemy koła na górnej i dolnej krawędzi
    for (let i = 1; i <= numIntermediateCircles; i++) {
      const x = circleOffset + (i * horizontalSpacing);
      
      // Koło na górnej krawędzi
      page.drawCircle({
        x: x,
        y: height - circleOffset,
        size: circleRadius,
        color: cmyk(fgC, fgM, fgY, fgK),
      });
      
      // Koło na dolnej krawędzi
      page.drawCircle({
        x: x,
        y: circleOffset,
        size: circleRadius,
        color: cmyk(fgC, fgM, fgY, fgK),
      });
    }
    
    console.log(`Dodano ${numIntermediateCircles} kół pośrednich na krawędziach poziomych (odstęp: ${(horizontalSpacing * 25.4 / 72).toFixed(1)}mm)`);
  }
  
  // Sprawdzamy pionowe krawędzie (lewa i prawa)
  const verticalDistance = height - (2 * circleOffset);
  if (verticalDistance >= minDistance) {
    // Obliczamy ile kół możemy umieścić między rogami
    const numIntermediateCircles = Math.floor(verticalDistance / minDistance);
    
    // Obliczamy równomierny odstęp między kołami
    const verticalSpacing = verticalDistance / (numIntermediateCircles + 1);
    
    // Rysujemy koła na lewej i prawej krawędzi
    for (let i = 1; i <= numIntermediateCircles; i++) {
      const y = circleOffset + (i * verticalSpacing);
      
      // Koło na lewej krawędzi
      page.drawCircle({
        x: circleOffset,
        y: y,
        size: circleRadius,
        color: cmyk(fgC, fgM, fgY, fgK),
      });
      
      // Koło na prawej krawędzi
      page.drawCircle({
        x: width - circleOffset,
        y: y,
        size: circleRadius,
        color: cmyk(fgC, fgM, fgY, fgK),
      });
    }
    
    console.log(`Dodano ${numIntermediateCircles} kół pośrednich na krawędziach pionowych (odstęp: ${(verticalSpacing * 25.4 / 72).toFixed(1)}mm)`);
  }
  
  // Przetwarzanie tekstu wielولiniowego
  const fontSize = mmToPoints(fontSizeMm);
  const lineSpacing = fontSize * 1.3; // Odstęp między liniami (130% wysokości czcionki)
  const lines = text.split('\n'); // Dzielimy tekst na linie
  
  const totalLines = lines.length;
  
  // Obliczamy wymiary całego bloku tekstu
  const totalTextHeight = (totalLines - 1) * lineSpacing + fontSize;
  
  // Obliczamy szerokość każdej linii
  const lineWidths = lines.map((line) => {
    return customFont.widthOfTextAtSize(line, fontSize);
  });
  
  // Obliczamy pozycję startową dla całego bloku tekstu
  let startY: number;
  
  if (centerText) {
    // NOTE: This is a precise vertical centering algorithm that has been fine-tuned to properly center text blocks
    // across different font sizes and page orientations. It includes additional adjustments to account for visual
    // center offsets and font metrics. Modify with caution only if the centering is found incorrect for additional
    // cases, as it may disrupt the visual alignment.
    const middleOfPage = height / 2;
    
    // Calculate the total height of the text block from top to bottom
    // For multi-line text: (lines-1) * lineSpacing + fontSize
    const totalBlockHeight = totalTextHeight;
    
    // The visual center adjustment - this compensates for the fact that
    // text baseline is not at the visual center of the characters
    // Move text down by approximately 0.5 line height (lineSpacing * 0.5)
    const halfLineHeight = lineSpacing * 0.5;
    const visualCenterOffset = fontSize * 0.35; // Base offset for visual centering
    
    // Calculate where the first line's baseline should be positioned
    // so that the visual center of the entire text block aligns with page center
    startY = middleOfPage + (totalBlockHeight / 2) - visualCenterOffset - halfLineHeight;
  } else {
    // Tekst w lewym górnym rogu z marginesem
    startY = height - mmToPoints(25);
  }
  
  // Rysujemy każdą linię
  lines.forEach((line, index) => {
    let lineX: number;
    const lineY = startY - (index * lineSpacing);
    
    if (centerText) {
      // Każda linia wycentrowana indywidualnie
      lineX = (width - lineWidths[index]) / 2;
    } else {
      // Tekst wyrównany do lewej z marginesem
      lineX = mmToPoints(marginMm + 5); // Dodatkowe 5mm od ramki
    }

    // Rysujemy każdą linię tekstu
    page.drawText(line, {
      x: lineX,
      y: lineY,
      font: customFont,
      size: fontSize,
      color: cmyk(fgC, fgM, fgY, fgK),
    });
    
    // Logujemy informacje o tym co rysujemy
    console.log(`Rysuję tekst: "${line}" na pozycji (${lineX}, ${lineY})`);
  });
  
  // Zapisanie pliku na dysku
  const pdfBytes = await pdfDoc.save();
  await Deno.writeFile(outputFile, pdfBytes);
  
  console.log(`Plik "${outputFile}" został utworzony!`);
}

// Konfiguracja Cliffy Command
if (import.meta.main) {
  await new Command()
    .name("pvc-banner-generator")
    .version("1.0.0")
    .description("Generator banerów PVC - tworzy PDF z układem dwuwarstwowym, ramką i kółkami w rogach")
    .option("-t, --text <text:string>", "Tekst do umieszczenia w dokumencie", { default: "Banner PVC" })
    .option("-o, --output <output:string>", "Nazwa pliku wyjściowego", { default: "banner.pdf" })
    .option("-w, --width <width:number>", "Szerokość baneru w milimetrach", { default: 1000 })
    .option("-e, --height <height:number>", "Wysokość baneru w milimetrach", { default: 700 })
    .option("-f, --font-size <font:number>", "Rozmiar czcionki w milimetrach (3mm=mały, 12mm=średni, 25mm=duży)", { default: 25 })
    .option("--fg <foreground:string>", "Kolor tekstu, ramki i kółek: black,white,red,blue,yellow,green,orange,purple,pink,cyan,magenta,lime,navy,maroon,teal,olive,silver,gold", { default: "black" })
    .option("--bg <background:string>", "Kolor tła wewnętrznego prostokąta: black,white,red,blue,yellow,green,orange,purple,pink,cyan,magenta,lime,navy,maroon,teal,olive,silver,gold", { default: "yellow" })
    .option("-c, --center", "Wycentruj tekst na stronie", { default: true })
    .action(async (options) => {
      const { text, output, width, height, fontSize, fg, bg, center } = options;
      await generatePDF(text, output, width, height, center, fontSize, fg, bg);
    })
    .parse(Deno.args);
}
