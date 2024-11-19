import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Provider as PaperProvider, Snackbar } from 'react-native-paper';

export default function App() {
  const [estoques, setEstoques] = useState({
    'Óleo 5W-30 Sintético': 0,
    'Óleo 5W-20 Sintético': 0,
    'Óleo 0W-20 Sintético': 0,
    'Óleo 5W-40 Sintético': 0,
    'Óleo 10W-60 Sintético': 0,
    'Óleo 10W-40 Semi-Sintético': 0,
    'Óleo 10W-30 Semi-Sintético': 0,
    'Óleo 15W-50 Semi-Sintético': 0,
    'Óleo 15W-40 Mineral': 0,
    'Óleo 20W-50 Mineral': 0,
  });
  const [quantidade, setQuantidade] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('Óleo 5W-30');
  const [relatorioVendas, setRelatorioVendas] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [senhaCorreta, setSenhaCorreta] = useState('1234'); // Senha para adicionar óleos
  const [senha, setSenha] = useState(''); // Senha inserida pelo usuário
  const [autenticado, setAutenticado] = useState(false); // Verifica se o usuário está autenticado

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    salvarEstoque();
  }, [estoques]);

  useEffect(() => {
    salvarRelatorioVendas();
  }, [relatorioVendas]);

  const salvarEstoque = async () => {
    try {
      await AsyncStorage.setItem('estoques', JSON.stringify(estoques));
    } catch (error) {
      console.log('Erro ao salvar estoque:', error);
    }
  };

  const salvarRelatorioVendas = async () => {
    try {
      await AsyncStorage.setItem('relatorioVendas', JSON.stringify(relatorioVendas));
    } catch (error) {
      console.log('Erro ao salvar relatório de vendas:', error);
    }
  };

  const carregarDados = async () => {
    try {
      const estoqueSalvo = await AsyncStorage.getItem('estoques');
      const relatorioSalvo = await AsyncStorage.getItem('relatorioVendas');

      if (estoqueSalvo) setEstoques(JSON.parse(estoqueSalvo));
      if (relatorioSalvo) setRelatorioVendas(JSON.parse(relatorioSalvo));
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    }
  };

  const mostrarSnackbar = (mensagem) => {
    setSnackbarMessage(mensagem);
    setSnackbarVisible(true);
  };

  const adicionarOleo = () => {
    const qtd = parseInt(quantidade);
    if (qtd > 0) {
      const novoEstoque = { ...estoques };
      novoEstoque[tipoSelecionado] += qtd;
      setEstoques(novoEstoque);
      mostrarSnackbar(`Adicionou ${qtd} de ${tipoSelecionado}`);
      setQuantidade('');
    } else {
      mostrarSnackbar('Digite uma quantidade válida');
    }
  };

  const venderOleo = () => {
    const qtd = parseInt(quantidade);
    if (qtd > 0 && qtd <= estoques[tipoSelecionado]) {
      const novoEstoque = { ...estoques };
      novoEstoque[tipoSelecionado] -= qtd;
      setEstoques(novoEstoque);

      const dataAtual = new Date();
      const dataFormatada = `${dataAtual.getDate()}/${dataAtual.getMonth() + 1}/${dataAtual.getFullYear()} ${dataAtual.getHours()}:${dataAtual.getMinutes()}`;

      setRelatorioVendas([
        ...relatorioVendas,
        `${tipoSelecionado}: ${qtd} unidades vendidas em ${dataFormatada}`,
      ]);

      mostrarSnackbar(`Vendeu ${qtd} de ${tipoSelecionado}`);
      setQuantidade('');
    } else {
      mostrarSnackbar('Quantidade inválida');
    }
  };

  const autenticar = () => {
    if (senha === senhaCorreta) {
      setAutenticado(true);
      mostrarSnackbar('Autenticado com sucesso!');
    } else {
      Alert.alert('Senha incorreta', 'Tente novamente.');
    }
    setSenha('');
  };

  const resetarEstoque = () => {
    setEstoques({
      'Óleo 5W-30 Sintético': 0,
      'Óleo 5W-20 Sintético': 0,
      'Óleo 0W-20 Sintético': 0,
      'Óleo 5W-40 Sintético': 0,
      'Óleo 10W-60 Sintético': 0,
      'Óleo 10W-40 Semi-Sintético': 0,
      'Óleo 10W-30 Semi-Sintético': 0,
      'Óleo 15W-50 Semi-Sintético': 0,
      'Óleo 15W-40 Mineral': 0,
      'Óleo 20W-50 Mineral': 0,
    });
    mostrarSnackbar('Estoque zerado!');
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {!autenticado ? (
          <View style={styles.authContainer}>
            <Text style={styles.title}>Autenticação</Text>
            <TextInput
              placeholder="Digite a senha"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
            />
            <Button title="Entrar" onPress={autenticar} color="#4CAF50" />
          </View>
        ) : (
          <>
            <Text style={styles.title}>Controle de Estoque de Óleo</Text>
            <Text style={styles.subTitle}>
              Estoque de {tipoSelecionado}: {estoques[tipoSelecionado]}
            </Text>

            <Picker
              selectedValue={tipoSelecionado}
              onValueChange={(itemValue) => setTipoSelecionado(itemValue)}
              style={styles.picker}
            >
              {Object.keys(estoques).map((tipo) => (
                <Picker.Item key={tipo} label={tipo} value={tipo} />
              ))}
            </Picker>

            <TextInput
              placeholder="Quantidade"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
              style={styles.input}
            />

            <View style={styles.buttonContainer}>
              <Button title="Adicionar Óleo" onPress={adicionarOleo} color="#4CAF50" />
              <Button title="Vender Óleo" onPress={venderOleo} color="#F44336" />
            </View>

            <Button title="Resetar Estoque" onPress={resetarEstoque} color="#FF5722" />

            <Text style={styles.sectionTitle}>Visualizar Estoque</Text>
            <ScrollView style={styles.estoqueContainer}>
              {Object.keys(estoques).map((tipo) => (
                <View key={tipo} style={styles.estoqueItem}>
                  <Text style={styles.estoqueTipo}>{tipo}</Text>
                  <Text style={styles.estoqueQuantidade}>{estoques[tipo]} unidades</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Relatório de Vendas:</Text>
            <ScrollView style={styles.relatorioContainer}>
              {relatorioVendas.length === 0 ? (
                <Text style={styles.relatorioItem}>Nenhuma venda registrada.</Text>
              ) : (
                relatorioVendas.map((venda, index) => (
                  <Text key={index} style={styles.relatorioItem}>{venda}</Text>
                ))
              )}
            </ScrollView>
          </>
        )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'Fechar',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  authContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  picker: {
    height: 50,
    backgroundColor: '#EFEFEF',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    fontSize: 18,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  estoqueContainer: {
    maxHeight: 200,
    padding: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 20,
  },
  estoqueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  estoqueTipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  estoqueQuantidade: {
    fontSize: 16,
    color: '#777',
  },
  relatorioContainer: {
    maxHeight: 200,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  relatorioItem: {
    fontSize: 16,
    paddingVertical: 5,
    color: '#333',
  },
});
