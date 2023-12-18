import React, { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Logo from '../public/logo.png'
import TextCapitulos from './TextCapitulos'

export const Capitulos = () => {
    //Importação das Imagens
    var LogoIF = require('../public/ifms-dr-marca-2015.png');
    var LogoEmbrapa = require('../public/logo-embrapa-400.png');
    var LogoIFEmbrapa = require('../public/logo-if-embrapa.png');

    const router = useRouter();
    const { query } = router;

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
    const [data, setData] = useState([]);
    const [activeTitle, setActiveTitle] = useState(null);
    const [showSummary, setShowSummary] = useState(true);
    const [backSummary, backSetShowSummary] = useState(true);
    const [expandedItems, setExpandedItems] = useState(['summary']);

    const toggleItem = (itemId) => {
        if (expandedItems.includes(itemId)) {
        setExpandedItems(expandedItems.filter((id) => id !== itemId));
        } else {
        setExpandedItems([...expandedItems, itemId]);
        }
    };

    const handleTitleClick = (titleId) => {
        setActiveTitle(titleId);
        localStorage.setItem('activeChapter', titleId.toString()); // Armazena o ID no localStorage
    };    

    const openSidebar = () => {
        setIsOffcanvasOpen(true);
    };    

    const handleToggle = () => {
        // Se houver algum item expandido, retraia todos os itens
        if (expandedItems.length > 0) {
          setExpandedItems([]);
        } else {
          // Caso contrário, alterne o estado de isCollapsed
          setIsCollapsed((prevState) => !prevState);
        }
    }; 

    const handleToggleBackDrop = () => {
        setIsOffcanvasOpen((prevState) => !prevState);
        setShowSummary(true);
    };

    const toggleSummaryAndMainMenu = () => {
        backSetShowSummary(!backSummary);
    };

    //Função para quando o usuário clicar no botão "← Voltar para o menu principal"
    const handleToggleMainNavbar = () => {
        const mainNavbarOptionsMenu = document.getElementById('main-navbar-options-menu');
        const summary = document.getElementById('summary');
      
        if (mainNavbarOptionsMenu && summary) {
          mainNavbarOptionsMenu.style.display = 'block';
          summary.style.display = 'none';
        }
    };

    //Função para quando o usuário quiser fechar o sidebar
    const closeSidebar = () => {
        const sidebarMenu = document.getElementById("sidebarMenu");
        if (sidebarMenu) {
          sidebarMenu.classList.remove("show");
        }
        setIsOffcanvasOpen(false);
        setShowSummary(false);
    }
   
    //useEffect para quando o usuário quiser fechar ou abrir os itens dentro do sumário do sidebar
    useEffect(() => {
        const anchorElement = document.getElementById('collapseExample1');
      
        if (anchorElement) {
            if (isCollapsed) {
                anchorElement.classList.add('collapse');
            } else {
                anchorElement.classList.remove('collapse');
          }
        }
      
        const backButton = document.getElementById('back-button');
        backButton.addEventListener('click', handleToggleMainNavbar);
      
        return () => {
            backButton.removeEventListener('click', handleToggleMainNavbar);
        };
    }, [isCollapsed]);
    
    //Puxando a API
    useEffect(() => {
        CarregaCapitulos();
        document.title = 'Embrapa Capitulos';
        if (query.activeChapter) {
            setActiveTitle(parseInt(query.activeChapter));
        } else {    
            // setActiveTitle(1); // Definir "introducao" como ativo por padrão

            // Verifica se há capítulos carregados
            if (data.length > 0) {
                // Encontra o id mais baixo entre os capítulos
                const lowestId = data.reduce(
                    (minId, data) => Math.min(minId, data.id),
                    data[0].id // Inicializa com o primeiro id
                );
                setActiveTitle(lowestId); // Define o id mais baixo como ativo
            }
        }
    }, [query.activeChapter]);

    const CarregaCapitulos = async () => {
        const url = 'https://api-cartilha.onrender.com/api/capitulos?populate=*';
        try {
            const response = await fetch(url);
            if (response.ok) {
                const json = await response.json();
                const data = json.data;
                console.log('API response:', data);
                setData(data);

                 // Ordenar os capítulos pelo ID
                const capituloOrdenado = data.sort((a, b) => a.id - b.id);

                // Definir o estado capitulos
                //setCapitulos(capituloOrdenado);

                // Definir o estado activeTitle com o ID do primeiro capítulo
                setActiveTitle(capituloOrdenado[0].id);
                
            } else {
                throw new Error('Falha na requisição. Código de status: ' + response.status);
            }
        } catch (error) {
            console.error(error);
        }
    };

    //Código para deixar o primeiro capitulo ativo e quando atualizar a página manter na mesma
    useEffect(() => {
        if (data.length > 0) {
          const storedActiveChapter = localStorage.getItem('activeChapter');
          if (storedActiveChapter) {
            setActiveTitle(parseInt(storedActiveChapter));
          } else {
            setActiveTitle(data[0].id);
          }
        }
    }, [data]);  
    
    useEffect(() => {
        if (activeTitle !== null) {
          localStorage.setItem('activeChapter', activeTitle.toString());
        }
    }, [activeTitle]);      

    useEffect(() => {
        if (activeTitle === null) {
            // Verifique se data não é nulo e se tem pelo menos um elemento
            if (data && data.length > 0) {
              // Se for nulo, defina-o como o primeiro capítulo da API
              setActiveTitle(data[0].id);
        
              // Use useRouter para navegar para o capítulo ativo
              router.push(`/edicao-completa?activeChapter=${data[0].id}`, undefined, { shallow: true });
            }
          }
        scrollToTop();
    }, [activeTitle, data, router]);

    // Função para rolar a página para o topo
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Adicionando um efeito de rolagem suave
        });
    };

    const activeChapter = data.find(item => item.id === activeTitle);
    const displayedTitle = activeChapter ? activeChapter.attributes.title : 'Título do Capítulo';

    return(
        <>
            <Head>
                <meta name="referrer" referrerPolicy="no-referrer" />
                <title>Embrapa</title>
            </Head>

            {/* Div que Pega todo o Conteúdo da Página */}
            <div className="container-wrapper">
                {/* Código Sidebar */}
                <nav id="sidebarMenu" className={`collapse d-lg-block sidebar bg-white thin-scrollbar ${isOffcanvasOpen ? 'show' : ''}`} tabIndex="-1">
                    <div className="position-sticky">
                        <div id="summary" className="list-group list-group-flush mt-2 py-2" style={{ display: backSummary ? 'block' : 'none' }}>
                            {/* Logo IF / Embrapa Dentro do Menu */}
                            <div className='logo-container-fixed'>
                                <div className="logo-container d-flex align-items-center justify-content-between">
                                    <Link href="/home">
                                        <Image className="img-sidebar-top mx-3" src={LogoIFEmbrapa} alt="logo Embrapa com letras em azul com um símbolo verde, sendo que as letras em cima do símbolo são brancas" width="45%" height={46} priority/>
                                    </Link>
                                    <button id="btn-close-sidebar" type="button" className="btn-close btn-close-dark btn-close-cap" data-bs-dismiss="collapse" aria-label="Close" onClick={() => { closeSidebar(); setShowSummary(false); }}></button>
                                </div>
                            </div>
                            <hr className="featurette-divider line-menu"></hr>
                            {/* Botão para Retornar as Opções "Edição Completa e Autores" | Opção Disponível quando a Tela é Menor que 992px */}
                            <button type="button" className="clean-btn navbar-sidebar__back" id="back-button" onClick={() => backSetShowSummary(true)}>← Voltar para o menu principal</button>
                            {/* Dropdown do Sumário */}                                
                            {data.length > 0 ? (
                                <div>
                                    <a
                                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ripple`}
                                    aria-current="true"
                                    onClick={() => toggleItem('summary')}
                                    >
                                    <span className="w-100 text-primary">Sumário</span>
                                    <i className={`fas fa-chevron-${expandedItems.includes('summary') ? 'down' : 'right'} icon-deg`}></i>
                                    </a>
                                    <div id="summary-content" className={`list-group list-group-flush mx-2 py-1 ${expandedItems.includes('summary') ? 'show' : 'collapse'}`}>
                                    {data.map((item) => (
                                        <div key={item.id}>
                                        {item.attributes.subtitle ? ( // Verifique se o subtitle está presente
                                            <a
                                                className={`list-group-item py-2 ${expandedItems.includes(item.id) ? 'active' : ''}`}
                                                onClick={() => toggleItem(item.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {item.attributes.title}
                                                {' '}
                                                <i className={`fas fa-chevron-${expandedItems.includes(item.id) ? 'down' : 'right'} icon-deg`} style={{ fontSize: '15px' }}></i>
                                            </a>
                                        ) : (
                                            <ul key={item.id} id="collapseExample1"
                                                className={`list-group list-group-flush mx-2 py-1 ${isCollapsed ? 'collapse' : 'show'}`}
                                            >
                                                <li className={`list-group-item py-2 ${activeTitle === item.id ? 'active' : ''}`}
                                                onClick={() => { handleTitleClick(item.id); setIsOffcanvasOpen(false);}}
                                                style={{cursor: 'pointer'}}>
                                                    <a
                                                        href={`#capitulo_${item.id}`}
                                                        className={activeTitle === item.id ? 'active-link-summary' : ''}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveTitle(item.id);
                                                            const targetId = `capitulo_${item.id}`;
                                                            const targetElement = document.getElementById(targetId);
                                                            if (targetElement) {
                                                            targetElement.scrollIntoView({ behavior: 'smooth' });
                                                            }
                                                        }}
                                                        style={{
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        {item.attributes.title}
                                                    </a>
                                                </li>
                                            </ul>
                                        )}
                                        {expandedItems.includes(item.id) && (
                                            <ul id={`capitulo_${item.id}`} className={`list-group list-group-flush mx-2 py-1`}>
                                                <li className={`list-group-item py-2 ${activeTitle === item.id ? 'active' : ''}`}
                                                onClick={() => { handleTitleClick(item.id); setIsOffcanvasOpen(false);}}
                                                style={{cursor: 'pointer'}}>
                                                    <a
                                                    href={`#capitulo_${item.id}`}
                                                    className={activeTitle === item.id ? 'active-link-summary' : ''}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setActiveTitle(item.id);
                                                        const targetId = `capitulo_${item.id}`;
                                                        const targetElement = document.getElementById(targetId);
                                                        if (targetElement) {
                                                        targetElement.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }}
                                                    >
                                                    {item.attributes.subtitle}
                                                    </a>
                                                </li>
                                            </ul>
                                        )}
                                        </div>
                                    ))}
                                    </div>
                                </div>
                                ) : (
                                <p className='d-flex justify-content-center' style={{ marginTop: 20 }}>Carregando dados...</p>
                                )}
                        </div>
                    </div>
                    {/* Opções Retornadas quando o Usuário Aperta no Botão "← Voltar para o menu principal" */}
                    <div id='main-navbar-options-menu' style={{ marginTop: 16, display: backSummary ? 'none' : 'block' }}>
                        <div className="logo-container d-flex align-items-center justify-content-between">
                            <Link href="/home">
                                <Image className="img-sidebar-top mx-3" src={LogoIFEmbrapa} alt="logo Embrapa com letras em azul com um símbolo verde, sendo que as letras em cima do símbolo são brancas" width="45%" height={46} priority/>
                            </Link>
                            <button id="btn-close-sidebar" type="button" className="btn-close btn-close-dark btn-close-cap" data-bs-dismiss="sidebar" aria-label="Close" onClick={closeSidebar}></button>
                        </div>
                        <hr className="featurette-divider line-menu"></hr>
                        <button type="button" className="clean-btn navbar-sidebar__back" id="back-button" onClick={toggleSummaryAndMainMenu}>← Voltar para o Sumário</button>
                        <ul className="navbar-nav ms-auto d-flex itens-menu-cap">
                            <li className="nav-item mx-3">
                                <Link className="nav-link back-item-link py-2" href="/edicao-completa" aria-current="page">
                                    <span className="link-text">Sumário</span>
                                </Link> 
                            </li>
                            <li className="nav-item mx-3">
                                <Link className="nav-link back-item-link py-2" href="/autores" aria-current="page">
                                    <span className="link-text">Autores</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Código Navbar */}
                <nav id="main-navbar" className="navbar navbar-expand-lg navbar-light bg-white fixed-top">
                    <div className="container-fluid">
                        <button className="navbar-toggler" type="button" data-mdb-toggle="collapse" data-mdb-target="#sidebarMenu"
                            aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle Offcanvas" onClick={handleToggleBackDrop}>
                            <i className="fas fa-bars"></i>
                        </button>
                        {/* Logo Navbar */}
                        <Link className="navbar-brand" href="/home">
                            <Image src={Logo} width="100%" height={40} alt="logo Embrapa com letras em azul com um simbolo verde, sendo que as letras em cima do simbolo são brancas"/>
                        </Link>
                        {/* Código dos Itens Exibidos no Navbar */}
                        <ul className="navbar-nav ms-auto d-flex flex-row">
                            <li className="nav-item text-item-link">
                                <Link className="nav-link back-item-link" href="/edicao-completa" aria-current="page">
                                    <span className="link-text">Sumário</span>
                                </Link> 
                            </li>
                            <li className="nav-item text-item-link">
                                <Link className="nav-link back-item-link" href="/autores" aria-current="page">
                                    <span className="link-text">Autores</span>
                                </Link>
                            </li>
                            {/* Input Search para tela maior que 992px */}
                            <div className="hide-form-search2">
                                <form className="d-flex rounded-pill p-1 position-relative first-form-search" role="search">
                                    <div className="input-group">
                                        <input
                                            className="form-control border-0 rounded-pill pr-5"
                                            type="search"
                                            placeholder="Buscar"
                                            aria-label="Search"
                                        />
                                        <div className="input-group-append">
                                            <span className="">
                                                <i className="fas fa-search icone-search-cap"></i>
                                            </span>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <li className="nav-item">
                                <Image src={LogoIF} className='logotipo me-3 img' width="100%" height={32} alt="Logotipo do IFMS Campus Dourados" priority/>
                            </li>
                            <li className="nav-item me-3 me-lg-0">
                                <Image src={LogoEmbrapa} className='logotipo img' width="100%" height={48} alt="Logotipo da Embrapa" priority/>
                            </li>

                            {/* Input Search para tela menor que 992px */}
                            <form className="d-flex rounded-pill position-relative" role="search">
                                <div className="input-group hide-form-search">
                                    <input
                                        className="form-control border-0 rounded-pill pr-5"
                                        type="search"
                                        placeholder="Buscar"
                                        aria-label="Search"
                                    />
                                    <div className="input-group-append">
                                        <span className="">
                                            <i className="fas fa-search icone-search"></i>
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </ul>
                    </div>
                    {isOffcanvasOpen && <div className="offcanvas-backdrop show" onClick={handleToggleBackDrop}></div>}
                </nav>
                
                {/* Conteúdo da Cartilha */}
                <main className='docMainContainer_gTbr'>
                    <div className='container padding-bottom--lg'>
                        <div className='col'>
                            <nav className="home-section" aria-label="Breadcrumbs" style={{marginTop: 120}}>    
                                {/* Código Navegação Estrutural | Trilha de Navegção do Usuário */}
                                <ul className="breadcrumbs">
                                    <li className="breadcrumbs__item">
                                        <Link href="/home" className="breadcrumbs__link">
                                            <i className="fas fa-home" style={{fontSize: '13px'}}></i>
                                        </Link>
                                        <i className="fas fa-chevron-right" style={{fontSize: '10px'}}></i>
                                    </li>
                                    <li className="breadcrumbs__item">
                                        <span className="breadcrumbs__link">Sumário</span>
                                        <meta itemProp="position" content="1" />
                                        <i className="fas fa-chevron-right" style={{fontSize: '10px'}}></i>
                                    </li>
                                    <li className="breadcrumbs__item breadcrumbs__item--active">
                                        <span className="breadcrumbs__link" itemProp="name">
                                            {displayedTitle}
                                        </span>
                                        <meta itemProp="position" content="2" />
                                    </li>
                                </ul>
                            </nav>
                            <section className="home-section right-sidebar" style={{marginTop: 30}}>
                                {/* Código dos Textos da Cartilha */}
                                <div id="contents" className="bd-content ps-lg-2">
                                    <TextCapitulos lista = {data} activeTitle={activeTitle} setActiveTitle={setActiveTitle} />
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
            
            {/* Código Footer Embrapa */}  
            <footer>
                <div className="container container-footer bottom-0 end-0">
                    <div className="title-footer">
                        <p>Embrapa Agropecuária Oeste</p>
                    </div>
                    <div className="description-footer">
                        <p>Rodovia BR 163, Km 253,6, Caixa Postal 449, CEP: 79804-970, Dourados, MS</p>
                        <p>Fone: + 55 (67) 3416-9700</p>
                    </div>
                </div>
            </footer>
        </>
    );
};
