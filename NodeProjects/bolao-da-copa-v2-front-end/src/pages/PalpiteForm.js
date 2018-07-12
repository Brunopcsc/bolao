
import React from 'react';
import NovoPalpiteMaquinaEstados from './NovoPalpiteMaquinaEstados';
import { Dropdown } from 'primereact/components/dropdown/Dropdown';


class PalpiteForm extends React.Component {
    constructor() {
        super();
        this.state = {
            email: '',
            senha: '',
            nome: '',
            telefone: '',
            dataDeNascimento: '',
            confirmarSenha: '',
            selected:{},
            estado: NovoPalpiteMaquinaEstados.inicio(),
            mensagem: 'Digite seu e-mail para dar início',
            mensagemClassName: 'alert alert-info',
            usuarioEncontrado: null,
            mostrarAjaxLoader: false,
            mensagensValidacao: {
                email: '',
                senha: '',
                nome: '',
                telefone: '',
                dataDeNascimento: '',
                campeao: '',
                vice: '',
                confirmarSenha: '',
            },
            selecoes : null,
        };
    }

    async componentDidMount(){
        const responseSelecoes = await fetch('http://localhost:8080/BolaoDaCopaV2RS/webresources/selecoes');
        var contentTypeSelecoes = responseSelecoes.headers.get("content-type");
        if (contentTypeSelecoes && contentTypeSelecoes.includes("application/json")) {
            const selecoesJson = await responseSelecoes.json();
            const selecoesOptions = selecoesJson.map((selecao) => { return { label: selecao, value: selecao }; });
            selecoesOptions.unshift( { label: 'Escolha a seleção', value: null});
            this.setState({ selecoes: selecoesOptions });
        }
   }

    handleUserInput(e) {
       const nome = e.target.name;
       const valor = e.target.value;
       const mensagensValidacao = Object.assign({}, this.state.mensagensValidacao);
       mensagensValidacao[nome] = this.validarCampo({ nome, valor });
       this.setState({
           [nome]: valor,
           mensagensValidacao,
       });
   }

   handleViceInput(e){
      const nome = 'vice';
      const valor = e.value;
       let selected = this.state.selected;
       const mensagensValidacao = Object.assign({}, this.state.mensagensValidacao);
       selected[nome] = { value: valor };
       mensagensValidacao[nome] = this.validarCampo({ nome, valor });
       this.setState({ selected: selected,
       mensagensValidacao, });
   }

   handleCampeaoInput(e){
      const nome = 'campeao';
      const valor = e.value;
       let selected = this.state.selected;
       const mensagensValidacao = Object.assign({}, this.state.mensagensValidacao);
       selected[nome] = { value: valor };
       mensagensValidacao[nome] = this.validarCampo({ nome, valor });
       this.setState({ selected: selected,
       mensagensValidacao, });
   }

   validarCampo({ nome, valor = null }) {
       if (valor === null) {
           if(nome === 'campeao' || nome === 'vice'){
              valor = this.state.selected[nome];
            }
          else
           valor = this.state[nome];
       }


       if (nome === 'email') {
           if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(valor)) {
               return 'E-mail está em formato incorreto';
           }
       } else if (nome === 'senha') {
           if (valor.length === 0) {
               return 'Senha não pode ser vazia';
           } else if (this.state.usuarioEncontrado === null) {
               if (valor.length < 6) {
                   return 'Senha muito curta';
               }
           }
       }else if (nome === 'campeao') {
           if (valor == null) {
               return 'Campeão não pode ser vazio';
           }
           else if(valor.value == null){
               return 'Campeão não pode ser vazio';
             }

       }
        else if (nome === 'vice') {
           if (valor == null) {
               return 'Vice não pode ser vazio';
           }
           else if(valor.value == null)
               return 'Vice não pode ser vazio';
           if (valor.value === this.state.selected.campeao.value) {
               return 'Campeão e vice não podem ser iguais';
           }
       }
       else if (nome === 'nome' || nome === 'telefone' || nome === 'dataDeNascimento') {
           if (valor === '') {
               return 'Não pode ser vazio';
           }
       } else if (nome === 'confirmarSenha') {
           if (this.state.usuarioEncontrado === null && this.state.estado.botaoConfirmarPalpiteVisivel) {
               const senha = this.state.senha;
               if (valor !== senha) {
                   return 'Confirmação da senha não confere';
               }
           }
       }
       return '';
   }


   validarFormulario() {
       const mensagensValidacao = Object.assign({}, this.state.mensagensValidacao);


       let temErro = false;


       for (let campo in mensagensValidacao) {
           const msg = this.validarCampo({ nome: campo });
           mensagensValidacao[campo] = msg;
           if (msg !== '') temErro = true;
       }


       this.setState({ mensagensValidacao });
       return !temErro;
   }

     async handleEmailChanged() {
        if (this.validarCampo({ nome: 'email' }) !== '') return;
        this.mostrarAjaxLoader();
        try {
            const response = await fetch('http://localhost:8080/BolaoDaCopaV2RS/webresources/usuario?email=' + this.state.email);
            var contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const usuarioJson = await response.json();
                this.setState({
                    estado: NovoPalpiteMaquinaEstados.usuarioExistente(),
                    usuarioEncontrado: usuarioJson
                });
                this.mostrarAviso('E-mail já cadastrado! Informe sua senha para enviar o palpite');
            } else {
                this.setState({ estado: NovoPalpiteMaquinaEstados.usuarioInexistente() });
                this.mostrarInfo('E-mail ainda não cadastrado! Informe uma nova senha e demais dados para cadastro');
            }
        } catch (e) {
            this.mostrarErro('Ocorreu um problema!');
            console.log(e);
        }
        this.ocultarAjaxLoader();
    }

    handleSenhaChanged() {
           if (!this.state.estado.eventoSenhaDesabilitado) {
               if (this.state.senha === this.state.usuarioEncontrado.senha) {
                   const d = new Date(this.state.usuarioEncontrado.dataDeNascimento.slice(0, -5));
                   this.setState({
                       nome: this.state.usuarioEncontrado.nome,
                       telefone: this.state.usuarioEncontrado.telefone,
                       dataDeNascimento: d.toISOString().slice(0, 10),
                   });
                   this.setState({ estado: NovoPalpiteMaquinaEstados.usuarioExistenteSenhaCorreta() });
                   this.mostrarSucesso('Senha correta! Informe seu palpite!');


               } else {
                   this.setState({ estado: NovoPalpiteMaquinaEstados.usuarioExistenteSenhaIncorreta() });
                   this.mostrarErro('Senha incorreta! Informe novamente!');
               }
           }
       }

   handleEnviarPalpiteClicked() {
        if (!this.validarFormulario()) {
            this.mostrarErro('Atenção! Alguns campos não foram corretamente preenchidos!');
            return;
        }
          if (this.state.usuarioEncontrado === null) {
              this.setState({ estado: NovoPalpiteMaquinaEstados.confirmarPalpiteUsuarioInexistente() });
              this.mostrarInfo('Verifique os dados, repita sua nova senha e confirme o palpite. Atenção, ao confirmar o palpite você concorda em pagar R$ 20,00');
          } else {
              this.setState({ estado: NovoPalpiteMaquinaEstados.confirmarPalpiteUsuarioExistente() });
              this.mostrarInfo('Verifique os dados e confirme o palpite. Atenção, ao confirmar o palpite você concorda em pagar R$ 20,00');
          }
    }

    async handleConfirmarPalpiteClicked() {
        if (!this.validarFormulario()) {
            this.mostrarErro('Atenção! Alguns campos não foram corretamente preenchidos!');
            return;
        }
        this.mostrarAjaxLoader();
        try {
            const novoPalpite = {
                campeao: this.state.selected.campeao.value,
                vice: this.state.selected.vice.value,
                palpiteiro: {
                    id: null,
                }
            };
            if (this.state.usuarioEncontrado === null) {
                const novoUsuario = {
                    nome: this.state.nome,
                    senha: this.state.senha,
                    email: this.state.email,
                    telefone: this.state.telefone,
                    dataDeNascimento: new Date(this.state.dataDeNascimento),
                };
                const response = await fetch('http://localhost:8080/BolaoDaCopaV2RS/webresources/usuario', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(novoUsuario),
                })
                const usuarioGravado = await response.json();
                novoPalpite.palpiteiro.id = usuarioGravado.id;
            } else {
                novoPalpite.palpiteiro.id = this.state.usuarioEncontrado.id;
            }
            await fetch('http://localhost:8080/BolaoDaCopaV2RS/webresources/palpite', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(novoPalpite),
            });


            this.mostrarSucesso(`Obrigado pelo palpite, ${this.state.nome}!`);
            this.setState({
                email: '',
                senha: '',
                nome: '',
                telefone: '',
                dataDeNascimento: '',
                selected: {},
                confirmarSenha: '',
                usuarioEncontrado: null,
            });
            this.setState({ estado: NovoPalpiteMaquinaEstados.inicio() });
        } catch (e) {
            this.mostrarErro('Ocorreu um problema!');
            console.log(e);
        }
        this.ocultarAjaxLoader();
    }

    mostrarAviso(mensagem) { this.setState({ mensagem, mensagemClassName: 'alert alert-warning', }); }
    mostrarInfo(mensagem) { this.setState({ mensagem, mensagemClassName: 'alert alert-info', }); }
    mostrarSucesso(mensagem) { this.setState({ mensagem, mensagemClassName: 'alert alert-success', }); }
    mostrarErro(mensagem) { this.setState({ mensagem, mensagemClassName: 'alert alert-danger', }); }

    mostrarAjaxLoader() { this.setState({ mostrarAjaxLoader: true }); }
    ocultarAjaxLoader() { this.setState({ mostrarAjaxLoader: false }); }

    render() {
        return (
            <div className="row">
                <div className="col-lg-12 text-center">
                    <h4>Novo palpite</h4>
                    <form className="form-horizontal" name="formPalpite">
                        <div className={this.state.mensagemClassName}>
                            {this.state.mensagem}
                        </div>
                        <div className="form-group">
                            <label className="col-sm-2 control-label" htmlFor="email">E-mail</label>
                            <div className="col-sm-4">
                              <input type="email"
                                 className="form-control"
                                 name="email"
                                 label="E-mail"
                                 value={this.state.email}
                                 onChange={(event) => this.handleUserInput(event)}
                                 onBlur={() => this.handleEmailChanged()} />
                             <span className="text text-danger">{this.state.mensagensValidacao['email']}</span>
                            </div>
                            <label className="col-sm-2 control-label" htmlFor="senha">Senha</label>
                            <div className="col-sm-4">
                              <input type="password"
                                  className="form-control"
                                  name="senha"
                                  label="Senha"
                                  disabled={this.state.estado.campoSenhaDesabilitado}
                                  value={this.state.senha}
                                  onChange={(event) => this.handleUserInput(event)}
                                  onBlur={() => this.handleSenhaChanged()} />
                              <span className="text text-danger">{this.state.mensagensValidacao['senha']}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-2 control-label" htmlFor="nome">Nome completo</label>
                            <div className="col-sm-10">
                                <input type="text"
                                    className="form-control"
                                    name="nome"
                                    label="Nome"
                                    disabled={this.state.estado.camposDadosPessoaisDesabilitados}
                                    value={this.state.nome}
                                    onChange={(event) => this.handleUserInput(event)}/>
                                <span className="text text-danger">{this.state.mensagensValidacao['nome']}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-2 control-label" htmlFor="telefone">Telefone</label>
                            <div className="col-sm-4">
                                <input type="text"
                                    className="form-control"
                                    name="telefone"
                                    label="Telefone"
                                    disabled={this.state.estado.camposDadosPessoaisDesabilitados}
                                    value={this.state.telefone}
                                    onChange={(event) => this.handleUserInput(event)}/>
                                <span className="text text-danger">{this.state.mensagensValidacao['telefone']}</span>
                            </div>
                            <label className="col-sm-3 control-label" htmlFor="dataDeNascimento">Data de nascimento</label>
                            <div className="col-sm-3">
                                <input type="date"
                                    className="form-control"
                                    name="dataDeNascimento"
                                    label="Data de nascimento"
                                    disabled={this.state.estado.camposDadosPessoaisDesabilitados}
                                    value={this.state.dataDeNascimento}
                                    onChange={(event) => this.handleUserInput(event)}>
                                </input>
                            <span className="text text-danger">{this.state.mensagensValidacao['dataDeNascimento']}</span>
                            </div>
                        </div>


                        <div className={this.state.estado.camposDadosPalpiteDestaque ? 'form-group has-success' : 'form-group'}>
                            <label className="col-sm-2 control-label" htmlFor="campeao">Campeão</label>
                            <div className="col-sm-4">
                            <Dropdown style={{ width: '100%' }}
                                 name="campeao"
                                 className="ui-column-filter"
                                 disabled={this.state.estado.camposDadosPalpiteDesabilitados}
                                 value={this.state.selected.campeao ? this.state.selected.campeao.value : null}
                                 options={this.state.selecoes}
                                 onChange={(event) => this.handleCampeaoInput(event)}  />
                             <span className="text text-danger">{this.state.mensagensValidacao['campeao']}</span>
                            </div>
                            {this.state.estado.campoConfirmacaoSenhaVisivel && (
                                <label className="col-sm-2 control-label" htmlFor="confirmarSenha">Confirme a senha</label>
                            )}
                            <div className="col-sm-4">
                                {this.state.estado.campoConfirmacaoSenhaVisivel && (
                                    <input type="password"
                                        className="form-control"
                                        name="confirmarSenha"
                                        label="Confirmação de senha"
                                        value={this.state.confirmarSenha}
                                        onChange={(event) => this.handleUserInput(event)} />
                                )}
                                <span className="text text-danger">{this.state.mensagensValidacao['confirmarSenha']}</span>
                            </div>

                        </div>
                        <div className={this.state.estado.camposDadosPalpiteDestaque ? 'form-group has-success' : 'form-group'}>
                            <label className="col-sm-2 control-label" htmlFor="vice">Vice</label>
                            <div className="col-sm-4">
                            <Dropdown style={{ width: '100%' }}
                                 name="vice"
                                 className="ui-column-filter"
                                 disabled={this.state.estado.camposDadosPalpiteDesabilitados}
                                 value={this.state.selected.vice ? this.state.selected.vice.value : null}
                                 options={this.state.selecoes}
                                 onChange={(event) => this.handleViceInput(event)}  />
                             <span className="text text-danger">{this.state.mensagensValidacao['vice']}</span>
                            </div>
                            <div className="col-sm-6">
                               {this.state.estado.botaoConfirmarPalpiteVisivel && (
                                   <a type="submit"
                                       className="btn btn-success"
                                       name="confirmar"
                                       onClick={() => this.handleConfirmarPalpiteClicked()}>
                                       Confirmar meu palpite
                                   </a>
                               )}
                           </div>
                        </div>


                        <div className="form-group">
                            <div className="col-sm-12">
                                <a className="btn btn-default"
                                    name="enviar"
                                    disabled={this.state.estado.botaoEnvioDesabilitado}
                                    onClick={() => this.handleEnviarPalpiteClicked()}>
                                    Enviar meu palpite
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
                {this.state.mostrarAjaxLoader && (<div className='ajaxLoaderClass' />)}
            </div>
        );
    }
}


export default PalpiteForm;
