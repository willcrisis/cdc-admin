import React, {Component} from "react";
import $ from "jquery";
import InputLabel from "./componentes/InputLabel";
import Button from "./componentes/Button";
import PubSub from "pubsub-js";
import TratadorErros from "./TratadorErros";

class FormularioAutor extends Component {
    constructor() {
        super();

        this.state = {nome: '', email: '', senha: ''};

        this.submeter = this.submeter.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    submeter(evento) {
        evento.preventDefault();
        $.ajax({
            type: 'POST',
            url: 'http://localhost:8080/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({nome: this.state.nome, email: this.state.email, senha: this.state.senha}),
            success: dados => {
                PubSub.publish('autor-cadastrado', dados);
                this.setState({nome: '', email: '', senha: ''});
                PubSub.publish('clear-errors');
            },
            error: erro => {
                if (erro.status === 400) {
                    new TratadorErros().publicarErros(erro.responseJSON.errors);
                }
            },
            beforeSend: () => {
                PubSub.publish('clear-errors');
            }
        });
    }

    setNome(evento) {
        this.setState({nome: evento.target.value});
    }

    setEmail(evento) {
        this.setState({email: evento.target.value});
    }

    setSenha(evento) {
        this.setState({senha: evento.target.value});
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.submeter}>
                    <InputLabel id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setNome}
                                label="Nome"/>
                    <InputLabel id="email" type="email" name="email" value={this.state.email} onChange={this.setEmail}
                                label="E-mail"/>
                    <InputLabel id="senha" type="password" name="senha" value={this.state.senha}
                                onChange={this.setSenha} label="Senha"/>
                    <Button type="submit" label="Gravar"/>
                </form>
            </div>
        );
    }
}

class ListaAutor extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map(autor => {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {
    constructor() {
        super();

        this.state = {lista: []};
        this.get = this.get.bind(this);
    }

    componentDidMount() {
        this.get();

        PubSub.subscribe('autor-cadastrado', () => {
            this.get();
        })
    }

    get() {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:8080/api/autores',
            dataType: 'json',
            success: dados => {
                this.setState({lista: dados});
            }
        });
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Autores</h1>
                </div>

                <div className="content" id="content">
                    <FormularioAutor />
                    <ListaAutor lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}