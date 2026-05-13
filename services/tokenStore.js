let adminTokens = null;

function salvarTokensAdmin(tokens) {
  adminTokens = tokens;
}

function getAdminTokens() {
  if (!adminTokens) {
    console.warn('Nenhum token Admin disponível. Faça login como Admin primeiro.');
  }
  return adminTokens;
}

module.exports = { salvarTokensAdmin, getAdminTokens };
