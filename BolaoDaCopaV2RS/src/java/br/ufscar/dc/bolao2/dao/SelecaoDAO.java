/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package br.ufscar.dc.bolao2.dao;

import br.ufscar.dc.bolao2.beans.Selecao;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Resource;
import javax.enterprise.context.RequestScoped;
import javax.sql.DataSource;

/**
 *
 * @author bruno
 */
@RequestScoped
public class SelecaoDAO {
    
    private final static String BUSCAR_SELECOES = "select"
            + " id, nome"
            + " from selecoes order by nome asc";
    @Resource(name = "jdbc/Bolao2DBLocal")
    DataSource dataSource;
    
    public List<String> listarTodasSelecoes() throws SQLException {
        List<String> ret = new ArrayList<>();
        try (Connection con = dataSource.getConnection();
                PreparedStatement ps = con.prepareStatement(BUSCAR_SELECOES)) {

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String s =rs.getString("nome");
                    ret.add(s);
                }
            }
        }
        return ret;
    }
}
