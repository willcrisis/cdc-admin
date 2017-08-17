import React, {Component} from "react";
import $ from "jquery";
import InputLabel from "./componentes/InputLabel";
import SelectLabel from "./componentes/SelectLabel";
import Button from "./componentes/Button";
import PubSub from "pubsub-js";
import TratadorErros from "./TratadorErros";

class FormularioLivro extends Component {
    constructor() {
        super();

        this.state = {preco: '', titulo: '', autorId: ''};

        this.submeter = this.submeter.bind(this);
    }

    submeter(evento) {
        evento.preventDefault();
        console.log(this.state.autorId);
        $.ajax({
            type: 'POST',
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({preco: this.state.preco, titulo: this.state.titulo, autorId: this.state.autorId}),
            success: dados => {
                PubSub.publish('livro-cadastrado', dados);
                this.setState({preco: '', titulo: '', autorId: ''});
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

    bind(name, event) {
        let obj = {};
        obj[name] = event.target.value;
        this.setState(obj);
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.submeter}>
                    <InputLabel id="titulo" type="text" name="titulo" value={this.state.titulo}
                                onChange={this.bind.bind(this, 'titulo')}
                                label="Título"/>
                    <InputLabel id="preco" type="number" name="preco" value={this.state.preco}
                                onChange={this.bind.bind(this, 'preco')}
                                label="Preço"/>
                    <SelectLabel id="autorId" name="autorId" onChange={this.bind.bind(this, 'autorId')} label="Autor"
                                 lista={this.props.autores} itemId="id" itemLabel="nome" value={this.state.autorId}/>
                    <Button type="submit" label="Gravar"/>
                </form>
            </div>
        );
    }
}

class ListaLivros extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Título</th>
                        <th>Preço</th>
                        <th>Autor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map(livro => {
                            return (
                                <tr key={livro.id}>
                                    <td>{livro.titulo}</td>
                                    <td>{livro.preco}</td>
                                    <td>{livro.autor.nome}</td>
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

export default class LivroBox extends Component {
    constructor() {
        super();

        this.state = {lista: [], autores: []};
        this.get = this.get.bind(this);
    }

    componentDidMount() {
        this.get();

        $.ajax({
            type: 'GET',
            url: 'http://localhost:8080/api/autores',
            dataType: 'json',
            success: dados => {
                this.setState({autores: dados});
            }
        });

        PubSub.subscribe('livro-cadastrado', () => {
            this.get();
        })
    }

    get() {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:8080/api/livros',
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
                    <h1>Livros</h1>
                </div>

                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores}/>
                    <ListaLivros lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}