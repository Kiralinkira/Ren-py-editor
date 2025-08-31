import { RenpyScript, RenpyElement } from '../types/renpy';

export interface ValidationIssue {
  type: 'error' | 'warning';
  elementId?: string;
  message: string;
  line?: number;
}

export class ScriptValidator {
  static validate(script: RenpyScript): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const definedLabels = new Set<string>();
    const usedLabels = new Set<string>();
    const definedCharacters = new Set(script.characters.map(c => c.id));
    const usedCharacters = new Set<string>();

    // First pass: collect all labels and character usage
    script.elements.forEach((element, index) => {
      if (element.type === 'label' && element.label) {
        if (definedLabels.has(element.label)) {
          issues.push({
            type: 'error',
            elementId: element.id,
            message: `重复的标签定义: ${element.label}`,
            line: index + 1
          });
        }
        definedLabels.add(element.label);
      }

      if (element.type === 'jump' && element.label) {
        usedLabels.add(element.label);
      }

      if (element.type === 'dialogue' && element.character) {
        usedCharacters.add(element.character);
      }
    });

    // Second pass: check for issues
    script.elements.forEach((element, index) => {
      // Check undefined jumps
      if (element.type === 'jump' && element.label) {
        if (!definedLabels.has(element.label)) {
          issues.push({
            type: 'error',
            elementId: element.id,
            message: `跳转到未定义的标签: ${element.label}`,
            line: index + 1
          });
        }
      }

      // Check undefined characters
      if (element.type === 'dialogue' && element.character) {
        if (element.character !== 'narrator' && !definedCharacters.has(element.character)) {
          issues.push({
            type: 'warning',
            elementId: element.id,
            message: `使用了未定义的角色: ${element.character}`,
            line: index + 1
          });
        }
      }

      // Check empty dialogue
      if (element.type === 'dialogue' && !element.content) {
        issues.push({
          type: 'warning',
          elementId: element.id,
          message: '对话内容为空',
          line: index + 1
        });
      }

      // Check menu with no choices
      if (element.type === 'menu' && (!element.choices || element.choices.length === 0)) {
        issues.push({
          type: 'error',
          elementId: element.id,
          message: '菜单没有任何选项',
          line: index + 1
        });
      }

      // Check menu with single choice
      if (element.type === 'menu' && element.choices && element.choices.length === 1) {
        issues.push({
          type: 'warning',
          elementId: element.id,
          message: '菜单只有一个选项',
          line: index + 1
        });
      }

      // Check invalid variable names
      if (element.type === 'variable' && element.variable) {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(element.variable)) {
          issues.push({
            type: 'error',
            elementId: element.id,
            message: `无效的变量名: ${element.variable}`,
            line: index + 1
          });
        }
      }
    });

    // Check for unused labels
    definedLabels.forEach(label => {
      if (label !== 'start' && !usedLabels.has(label)) {
        const element = script.elements.find(el => el.type === 'label' && el.label === label);
        if (element) {
          issues.push({
            type: 'warning',
            elementId: element.id,
            message: `未使用的标签: ${label}`,
            line: script.elements.indexOf(element) + 1
          });
        }
      }
    });

    // Check for missing start label
    if (!definedLabels.has('start')) {
      issues.push({
        type: 'warning',
        message: '缺少 start 标签（游戏入口点）'
      });
    }

    return issues;
  }

  static getIssueSummary(issues: ValidationIssue[]): string {
    const errors = issues.filter(i => i.type === 'error').length;
    const warnings = issues.filter(i => i.type === 'warning').length;
    
    if (errors === 0 && warnings === 0) {
      return '✅ 脚本验证通过';
    }
    
    const parts = [];
    if (errors > 0) parts.push(`${errors} 个错误`);
    if (warnings > 0) parts.push(`${warnings} 个警告`);
    
    return `⚠️ ${parts.join('，')}`;
  }
}