import { RenpyElement, RenpyCharacter, RenpyScript, MenuChoice } from '../types/renpy';

export class RenpyParser {
  static parseScript(script: string): RenpyScript {
    const lines = script.split('\n');
    const characters: RenpyCharacter[] = [];
    const elements: RenpyElement[] = [];
    
    let currentLabel = '';
    let currentIndent = 0;
    let menuContext: { choices: MenuChoice[], currentChoice?: MenuChoice } | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const indent = line.length - line.trimStart().length;
      
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Parse character definitions
      if (trimmed.startsWith('define ') && trimmed.includes('Character(')) {
        const match = trimmed.match(/define\s+(\w+)\s*=\s*Character\s*\(\s*["'](.+?)["'](.*?)\)/);
        if (match) {
          const [, id, name, options] = match;
          const character: RenpyCharacter = { id, name };
          
          // Parse color
          const colorMatch = options.match(/color\s*=\s*["'](.+?)["']/);
          if (colorMatch) character.color = colorMatch[1];
          
          characters.push(character);
        }
      }
      
      // Parse labels
      else if (trimmed.startsWith('label ')) {
        const match = trimmed.match(/label\s+(\w+)\s*:/);
        if (match) {
          currentLabel = match[1];
          elements.push({
            id: `element-${elements.length}`,
            type: 'label',
            label: currentLabel
          });
        }
      }
      
      // Parse scenes
      else if (trimmed.startsWith('scene ')) {
        const match = trimmed.match(/scene\s+(\S+)(\s+with\s+(\w+))?/);
        if (match) {
          elements.push({
            id: `element-${elements.length}`,
            type: 'scene',
            image: match[1],
            transition: match[3]
          });
        }
      }
      
      // Parse show statements
      else if (trimmed.startsWith('show ')) {
        const match = trimmed.match(/show\s+(\S+)(\s+(\S+))?(\s+at\s+(\w+))?(\s+with\s+(\w+))?/);
        if (match) {
          elements.push({
            id: `element-${elements.length}`,
            type: 'show',
            image: match[1] + (match[3] ? ' ' + match[3] : ''),
            position: (match[5] as any) || 'center',
            transition: match[7]
          });
        }
      }
      
      // Parse hide statements
      else if (trimmed.startsWith('hide ')) {
        const match = trimmed.match(/hide\s+(\S+)(\s+with\s+(\w+))?/);
        if (match) {
          elements.push({
            id: `element-${elements.length}`,
            type: 'hide',
            image: match[1],
            transition: match[3]
          });
        }
      }
      
      // Parse play statements
      else if (trimmed.startsWith('play ')) {
        const match = trimmed.match(/play\s+(\w+)\s+["'](.+?)["']/);
        if (match) {
          elements.push({
            id: `element-${elements.length}`,
            type: 'play',
            channel: match[1] as any,
            audio: match[2]
          });
        }
      }
      
      // Parse menu
      else if (trimmed === 'menu:') {
        menuContext = { choices: [] };
      }
      
      // Parse menu choices
      else if (menuContext && indent > currentIndent && trimmed.startsWith('"')) {
        const match = trimmed.match(/^"(.+?)"\s*:/);
        if (match) {
          const choice: MenuChoice = {
            id: `choice-${menuContext.choices.length}`,
            text: match[1],
            actions: []
          };
          menuContext.choices.push(choice);
          menuContext.currentChoice = choice;
        }
      }
      
      // Parse menu choice actions
      else if (menuContext && menuContext.currentChoice && indent > currentIndent + 4) {
        // Simplified: just add as dialogue for now
        if (!trimmed.startsWith('$') && !trimmed.startsWith('jump') && !trimmed.startsWith('call')) {
          menuContext.currentChoice.actions.push({
            id: `element-${elements.length}`,
            type: 'dialogue',
            content: trimmed.replace(/^["']|["']$/g, '')
          });
        }
      }
      
      // End menu context
      else if (menuContext && indent <= currentIndent) {
        elements.push({
          id: `element-${elements.length}`,
          type: 'menu',
          choices: menuContext.choices
        });
        menuContext = null;
      }
      
      // Parse dialogue
      else if (!menuContext && (trimmed.startsWith('"') || trimmed.includes(' "'))) {
        const characterMatch = trimmed.match(/^(\w+)\s+"(.+?)"/);
        if (characterMatch) {
          elements.push({
            id: `element-${elements.length}`,
            type: 'dialogue',
            character: characterMatch[1],
            content: characterMatch[2]
          });
        } else if (trimmed.startsWith('"')) {
          elements.push({
            id: `element-${elements.length}`,
            type: 'dialogue',
            content: trimmed.replace(/^["']|["']$/g, '')
          });
        }
      }
      
      // Parse variables
      else if (trimmed.startsWith('$')) {
        const match = trimmed.match(/\$\s*(\w+)\s*=\s*(.+)/);
        if (match) {
          elements.push({
            id: `element-${elements.length}`,
            type: 'variable',
            variable: match[1],
            value: match[2]
          });
        }
      }
      
      // Parse jump
      else if (trimmed.startsWith('jump ')) {
        const match = trimmed.match(/jump\s+(\w+)/);
        if (match) {
          elements.push({
            id: `element-${elements.length}`,
            type: 'jump',
            label: match[1]
          });
        }
      }
      
      currentIndent = indent;
    }
    
    return {
      characters,
      elements,
      assets: {
        images: [],
        audio: [],
        backgrounds: []
      }
    };
  }
  
  static generateScript(script: RenpyScript): string {
    const lines: string[] = [];
    
    // Generate character definitions
    script.characters.forEach(char => {
      let charDef = `define ${char.id} = Character("${char.name}"`;
      if (char.color) charDef += `, color="${char.color}"`;
      charDef += ')';
      lines.push(charDef);
    });
    
    if (script.characters.length > 0) lines.push('');
    
    // Generate elements
    let indent = 0;
    script.elements.forEach((element, index) => {
      const indentStr = '    '.repeat(indent);
      
      switch (element.type) {
        case 'label':
          lines.push(`${indentStr}label ${element.label}:`);
          indent = 1;
          break;
          
        case 'scene':
          let sceneLine = `${indentStr}scene ${element.image}`;
          if (element.transition) sceneLine += ` with ${element.transition}`;
          lines.push(sceneLine);
          break;
          
        case 'show':
          let showLine = `${indentStr}show ${element.image}`;
          if (element.position && element.position !== 'center') {
            showLine += ` at ${element.position}`;
          }
          if (element.transition) showLine += ` with ${element.transition}`;
          lines.push(showLine);
          break;
          
        case 'hide':
          let hideLine = `${indentStr}hide ${element.image}`;
          if (element.transition) hideLine += ` with ${element.transition}`;
          lines.push(hideLine);
          break;
          
        case 'dialogue':
          if (element.character) {
            lines.push(`${indentStr}${element.character} "${element.content}"`);
          } else {
            lines.push(`${indentStr}"${element.content}"`);
          }
          break;
          
        case 'menu':
          lines.push(`${indentStr}menu:`);
          element.choices?.forEach(choice => {
            lines.push(`${indentStr}    "${choice.text}":`);
            choice.actions.forEach(action => {
              if (action.type === 'dialogue') {
                lines.push(`${indentStr}        "${action.content}"`);
              }
              // Add more action types as needed
            });
          });
          break;
          
        case 'play':
          lines.push(`${indentStr}play ${element.channel} "${element.audio}"`);
          break;
          
        case 'variable':
          lines.push(`${indentStr}$ ${element.variable} = ${element.value}`);
          break;
          
        case 'jump':
          lines.push(`${indentStr}jump ${element.label}`);
          break;
          
        case 'return':
          lines.push(`${indentStr}return`);
          indent = 0;
          break;
      }
    });
    
    return lines.join('\n');
  }
}