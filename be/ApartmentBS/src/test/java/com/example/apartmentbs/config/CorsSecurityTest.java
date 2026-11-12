package com.example.apartmentbs.config;

import com.example.apartmentbs.controller.ApartmentController;
import com.example.apartmentbs.repository.UserRepository;
import com.example.apartmentbs.service.ApartmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApartmentController.class)
@Import({SecurityConfig.class, CorsConfig.class, JwtAuthenticationFilter.class})
class CorsSecurityTest {

    private static final String ORIGIN = "https://sba301-pc-abms.vercel.app";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ApartmentService apartmentService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    void preflightOptionsShouldReturnCorsHeaders() throws Exception {
        mockMvc.perform(options("/api/v1/admin/apartments/all")
                        .header("Origin", ORIGIN)
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", ORIGIN))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void unauthorizedGetShouldStillReturnCorsHeaders() throws Exception {
        mockMvc.perform(get("/api/v1/admin/apartments/all")
                        .header("Origin", ORIGIN))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Access-Control-Allow-Origin", ORIGIN))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void unauthorizedPostWithInvalidTokenShouldStillReturnCorsHeaders() throws Exception {
        mockMvc.perform(post("/api/v1/admin/apartments")
                        .header("Origin", ORIGIN)
                        .header("Authorization", "Bearer mock-jwt-token-admin-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roomNumber\":\"B-121\",\"floor\":1,\"buildingBlock\":\"Tòa B\",\"areaSqm\":101}"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Access-Control-Allow-Origin", ORIGIN))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
}
