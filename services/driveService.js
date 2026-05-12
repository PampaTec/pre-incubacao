const { google } = require('googleapis');

/**
 * Cria uma nova pasta no Google Drive
 * @param {object} auth Cliente OAuth autenticado
 * @param {string} folderName Nome da nova pasta
 * @param {string} parentFolderId ID da pasta pai (opcional)
 * @returns {Promise<string>} ID da pasta criada
 */
const criarPasta = async (auth, folderName, parentFolderId = null) => {
    const drive = google.drive({ version: 'v3', auth });
    
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
    };
    
    if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
    }

    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id',
        });
        return file.data.id;
    } catch (err) {
        console.error('Erro ao criar pasta no Drive:', err);
        throw err;
    }
};

/**
 * Clona um arquivo (Documento ou Planilha) no Drive
 * @param {object} auth Cliente OAuth autenticado
 * @param {string} fileId ID do arquivo original (template)
 * @param {string} newName Nome da cópia
 * @param {string} destinationFolderId ID da pasta destino
 * @returns {Promise<string>} ID do novo arquivo clonado
 */
const clonarArquivo = async (auth, fileId, newName, destinationFolderId) => {
    const drive = google.drive({ version: 'v3', auth });
    
    try {
        const response = await drive.files.copy({
            fileId: fileId,
            resource: {
                name: newName,
                parents: [destinationFolderId]
            },
            fields: 'id'
        });
        return response.data.id;
    } catch (err) {
        console.error('Erro ao clonar arquivo:', err);
        throw err;
    }
};

/**
 * Compartilha um arquivo ou pasta com uma lista de e-mails
 * @param {object} auth Cliente OAuth autenticado
 * @param {string} fileId ID do arquivo ou pasta
 * @param {string[]} emails Array de e-mails para compartilhar
 * @param {string} role Papel (padrão: 'writer' para editar, 'reader' para visualizar)
 */
const compartilharComUsuarios = async (auth, fileId, emails, role = 'writer') => {
    const drive = google.drive({ version: 'v3', auth });
    
    try {
        const promises = emails.map(email => 
            drive.permissions.create({
                fileId: fileId,
                resource: {
                    type: 'user',
                    role: role,
                    emailAddress: email
                },
                fields: 'id',
                sendNotificationEmail: true // Opcional: envia e-mail avisando
            })
        );
        await Promise.all(promises);
    } catch (err) {
        console.error('Erro ao compartilhar arquivo:', err);
        throw err;
    }
};

/**
 * Lista arquivos dentro de uma pasta específica
 * @param {object} auth Cliente OAuth autenticado
 * @param {string} folderId ID da pasta
 * @returns {Promise<Array>} Lista de arquivos (nome, id, mimeType)
 */
const listarArquivosNaPasta = async (auth, folderId) => {
    const drive = google.drive({ version: 'v3', auth });
    
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType)',
            spaces: 'drive'
        });
        return response.data.files;
    } catch (err) {
        console.error('Erro ao listar arquivos:', err);
        throw err;
    }
};

module.exports = {
    criarPasta,
    clonarArquivo,
    compartilharComUsuarios,
    listarArquivosNaPasta
};
