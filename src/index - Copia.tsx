useEffect(() => {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isIOS) {
    console.log("Usuário iOS");

    // você pode mostrar um alerta ou UI
    alert("Para instalar: toque em compartilhar e depois 'Adicionar à Tela de Início'");
  }
}, []);