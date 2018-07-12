/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package br.ufscar.dc.bolao2.servicos;

import br.ufscar.dc.bolao2.beans.Palpite;
import br.ufscar.dc.bolao2.dao.SelecaoDAO;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author bruno
 */
    
@Stateless
@Path("selecoes")
public class ServicosSelecao {


    @Inject
    SelecaoDAO selecaoDAO;


    @GET
    @Produces(MediaType.APPLICATION_JSON)
    
    public Response getSelecoes() {
        try {
            return Response.ok(selecaoDAO.listarTodasSelecoes()).build();
        } catch (SQLException ex) {
            Logger.getLogger(ServicosPalpite.class.getName()).log(Level.SEVERE, null, ex);
            return Response.serverError().build();
        }
    }

}

