# Ambiente Interno - Guia de Configuração

## Acessando o Site na Rede Interna

### Opção 1: Usando o Script (Recomendado)
Execute o script apropriado para seu sistema operacional:

**Windows:**
```bash
start-internal.bat
```

**Linux/Mac:**
```bash
chmod +x start-internal.sh
./start-internal.sh
```

### Opção 2: Usando npm
```bash
npm run dev:internal
```

### Opção 3: Manualmente
```bash
npm run dev -- --host 0.0.0.0
```

## URLs de Acesso

Após iniciar o servidor, você poderá acessar o site através de:

- **Local:** http://localhost:5173
- **Rede Interna:** http://[IP-DO-SERVIDOR]:5173

Para encontrar o IP do servidor:
- **Windows:** Abra o prompt e digite `ipconfig`
- **Linux/Mac:** Abra o terminal e digite `ifconfig` ou `ip addr show`

## Configurações Realizadas

1. **Vite Config:** Host configurado para `0.0.0.0` permitindo acesso externo
2. **Scripts:** Novo script `dev:internal` para facilitar o uso
3. **Scripts de Inicialização:** Arquivos `.bat` e `.sh` para facilitar o uso

## Notas de Segurança

- Esta configuração expõe o servidor na rede interna
- Certifique-se de que sua rede interna é segura
- Para produção, considere usar HTTPS e autenticação adicional
