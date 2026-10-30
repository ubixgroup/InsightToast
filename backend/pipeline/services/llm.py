"""
LLM Factory Service for the RAG Pipeline.

Provides a unified interface to get the appropriate LLM (Ollama or Gemini)
based on the agent's requirements.
"""

from __future__ import annotations

import os
from typing import Optional

from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama

from config import RAGConfig, get_default_config, AgentLLMConfig


class LLMFactory:
    """Factory for creating LLM instances based on configuration."""

    _instance = None

    def __init__(self, config: Optional[RAGConfig] = None):
        self.config = config or get_default_config()

    @classmethod
    def get_instance(cls, config: Optional[RAGConfig] = None) -> "LLMFactory":
        """Get singleton instance, create if doesn't exist."""
        if cls._instance is None:
            cls._instance = cls(config)
        elif config is not None:
            # Update config if provided
            cls._instance.config = config
        return cls._instance

    def get_gemini(
        self, model: str, temperature: Optional[float] = None
    ) -> ChatGoogleGenerativeAI:
        """Get a Gemini LLM instance."""
        api_key = self.config.llm.gemini_api_key or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GOOGLE_API_KEY is not set. Set it in environment or config."
            )

        temp = (
            temperature
            if temperature is not None
            else self.config.llm.gemini_temperature
        )

        use_vertexai = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() in (
            "true",
            "1",
            "yes",
        )
        if use_vertexai:
            # Vertex AI publisher endpoints do not support AI Studio "-latest" aliases
            vertex_alias_map = {
                "gemini-flash-latest": "gemini-3.5-flash",
                "gemini-flash-lite-latest": "gemini-3.5-flash-lite",
            }
            model = vertex_alias_map.get(model, model)

        print(
            f"[LLM_FACTORY] Creating Gemini model='{model}', temperature={temp}, vertexai={use_vertexai}, timeout=15s"
        )

        # Handle thinking configuration based on model version
        if "gemini-3" in model or "-latest" in model:
            # Gemini 3.x models (and -latest aliases, which currently
            # resolve to a Gemini 3.x-generation model): use thinking_level
            return ChatGoogleGenerativeAI(
                model=model,
                temperature=temp,
                thinking_level="minimal",
                api_key=api_key,
                vertexai=use_vertexai,
                timeout=15,  # 15 second timeout to prevent long waits
            )
        else:
            # Gemini 2.x models: use thinking_budget=0 to disable
            return ChatGoogleGenerativeAI(
                model=model,
                temperature=temp,
                thinking_budget=0,
                api_key=api_key,
                vertexai=use_vertexai,
                timeout=15,  # 15 second timeout to prevent long waits
            )

    def get_ollama(self, model: str, temperature: Optional[float] = None) -> ChatOllama:
        """Get an Ollama LLM instance."""
        temp = (
            temperature
            if temperature is not None
            else self.config.llm.ollama_temperature
        )

        print(
            f"[LLM_FACTORY] Creating Ollama model='{model}', temperature={temp}, timeout=30s"
        )

        return ChatOllama(
            model=model,
            base_url=self.config.llm.ollama_base_url,
            temperature=temp,
            timeout=30,  # 30 second timeout to prevent long waits
        )

    def get_for_agent(
        self, agent_name: str, temperature: Optional[float] = None
    ) -> BaseChatModel:
        """
        Get the appropriate LLM for a specific agent.

        Args:
            agent_name: Name of the agent (must be in config.agent_llm_mapping)
            temperature: Optional temperature override

        Returns:
            The configured LLM instance for this agent
        """
        # Get agent's LLM config
        agent_llm_config = self.config.agent_llm_mapping.get(agent_name)

        if agent_llm_config is None:
            # Fallback to default Gemini
            print(
                f"[LLM_FACTORY] No mapping for agent='{agent_name}'. "
                f"Falling back to default Gemini model='{self.config.llm.default_gemini_model}'."
            )
            return self.get_gemini(
                model=self.config.llm.default_gemini_model, temperature=temperature
            )

        # Use temperature from agent config if not overridden
        temp = temperature if temperature is not None else agent_llm_config.temperature

        print(
            f"[LLM_FACTORY] Resolved agent='{agent_name}' -> "
            f"provider='{agent_llm_config.provider}', model='{agent_llm_config.model}', temperature={temp}"
        )

        if agent_llm_config.provider == "ollama":
            return self.get_ollama(agent_llm_config.model, temp)
        else:
            return self.get_gemini(agent_llm_config.model, temp)

    def get_agent_info(self, agent_name: str) -> tuple[str, str]:
        """
        Get the provider and model for an agent.

        Returns:
            Tuple of (provider, model)
        """
        agent_llm_config = self.config.agent_llm_mapping.get(agent_name)

        if agent_llm_config is None:
            return ("gemini", self.config.llm.default_gemini_model)

        return (agent_llm_config.provider, agent_llm_config.model)


def get_llm(
    agent_name: str,
    config: Optional[RAGConfig] = None,
    temperature: Optional[float] = None,
) -> BaseChatModel:
    """
    Convenience function to get the appropriate LLM for an agent.

    Args:
        agent_name: Name of the agent
        config: Optional configuration override
        temperature: Optional temperature override

    Returns:
        The configured LLM instance
    """
    factory = LLMFactory.get_instance(config)
    return factory.get_for_agent(agent_name, temperature)


def get_agent_llm_info(
    agent_name: str, config: Optional[RAGConfig] = None
) -> tuple[str, str]:
    """
    Get the provider and model info for an agent.

    Args:
        agent_name: Name of the agent
        config: Optional configuration override

    Returns:
        Tuple of (provider, model)
    """
    factory = LLMFactory.get_instance(config)
    return factory.get_agent_info(agent_name)
