import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Typography,
  Chip,
  Paper,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { RenpyScript } from '../../types/renpy';
import { useLanguage } from '../../contexts/LanguageContext';

interface Variable {
  name: string;
  type: 'boolean' | 'number' | 'string' | 'list';
  value: any;
  description?: string;
  usageCount: number;
}

interface VariableManagerProps {
  open: boolean;
  onClose: () => void;
  script: RenpyScript;
  onInsertVariable: (varName: string) => void;
}

export const VariableManager: React.FC<VariableManagerProps> = ({
  open,
  onClose,
  script,
  onInsertVariable
}) => {
  const { t } = useLanguage();
  const [variables, setVariables] = useState<Variable[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVar, setEditingVar] = useState<Variable | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // 从脚本中提取变量
  useEffect(() => {
    const varMap = new Map<string, Variable>();
    
    script.elements.forEach(element => {
      if (element.type === 'variable' && element.variable) {
        const existing = varMap.get(element.variable);
        if (existing) {
          existing.usageCount++;
        } else {
          varMap.set(element.variable, {
            name: element.variable,
            type: guessType(element.value),
            value: element.value,
            usageCount: 1
          });
        }
      }
    });

    setVariables(Array.from(varMap.values()));
  }, [script]);

  const guessType = (value: any): Variable['type'] => {
    if (value === 'True' || value === 'False') return 'boolean';
    if (!isNaN(Number(value))) return 'number';
    if (value.startsWith('[') && value.endsWith(']')) return 'list';
    return 'string';
  };

  const filteredVariables = variables.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: Variable['type']) => {
    switch (type) {
      case 'boolean': return 'primary';
      case 'number': return 'secondary';
      case 'string': return 'success';
      case 'list': return 'warning';
      default: return 'default';
    }
  };

  const VariableForm = ({ variable, onSave }: { variable?: Variable, onSave: (v: Variable) => void }) => {
    const [formData, setFormData] = useState<Partial<Variable>>(
      variable || { name: '', type: 'string', value: '', usageCount: 0 }
    );

    const handleSave = () => {
      if (formData.name && formData.type) {
        onSave(formData as Variable);
      }
    };

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('variables.name') || "变量名"}
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!!variable}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('variables.type') || "类型"}</InputLabel>
              <Select
                value={formData.type || 'string'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Variable['type'] })}
                label={t('variables.type') || "类型"}
              >
                <MenuItem value="boolean">布尔值 (True/False)</MenuItem>
                <MenuItem value="number">数字</MenuItem>
                <MenuItem value="string">字符串</MenuItem>
                <MenuItem value="list">列表</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('variables.value') || "默认值"}
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              helperText={
                formData.type === 'boolean' ? '输入 True 或 False' :
                formData.type === 'list' ? '输入 [item1, item2, ...]' :
                ''
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('variables.description') || "描述（可选）"}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button onClick={() => {
                setEditingVar(null);
                setShowAddForm(false);
              }}>
                {t('common.cancel')}
              </Button>
              <Button variant="contained" onClick={handleSave}>
                {t('common.save')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{t('variables.title') || "变量管理器"}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('variables.search') || "搜索变量..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {showAddForm && (
          <VariableForm onSave={(v) => {
            setVariables([...variables, v]);
            setShowAddForm(false);
          }} />
        )}

        {editingVar && (
          <VariableForm 
            variable={editingVar} 
            onSave={(v) => {
              setVariables(variables.map(variable => variable.name === v.name ? v : variable));
              setEditingVar(null);
            }} 
          />
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="text.secondary">
            共 {filteredVariables.length} 个变量
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={() => setShowAddForm(true)}
          >
            {t('variables.add') || "添加变量"}
          </Button>
        </Box>

        <Paper variant="outlined">
          <List>
            {filteredVariables.map((variable) => (
              <ListItem key={variable.name}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontFamily="monospace">
                        {variable.name}
                      </Typography>
                      <Chip 
                        label={variable.type} 
                        size="small" 
                        color={getTypeColor(variable.type)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        使用 {variable.usageCount} 次
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        值: {String(variable.value)}
                      </Typography>
                      {variable.description && (
                        <Typography variant="caption" color="text.secondary">
                          {variable.description}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    size="small"
                    onClick={() => onInsertVariable(variable.name)}
                    title="插入到编辑器"
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => setEditingVar(variable)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    color="error"
                    onClick={() => setVariables(variables.filter(v => v.name !== variable.name))}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>

        {filteredVariables.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {searchQuery ? '没有找到匹配的变量' : '还没有定义任何变量'}
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};

// 添加Grid导入
import { Grid } from '@mui/material';